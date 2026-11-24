import { expect, test, type Page } from '@playwright/test'

async function pick(page: Page, criterion: string, whole: number) {
  await page.getByLabel(`${criterion} whole number`).getByLabel(String(whole), { exact: true }).click()
}

async function join(page: Page, name: string) {
  await page.getByLabel('Your name').fill(name)
  await page.getByRole('button', { name: 'Continue' }).click()
}

async function joinByLink(page: Page, code: string, name: string) {
  await page.goto(`/#/r/${code}`)
  await join(page, name)
}

async function joinWithCode(page: Page, code: string, name: string) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Join a room' }).click()
  await page.getByLabel('Room code').fill(code.toLowerCase())
  await page.getByRole('button', { name: 'Join', exact: true }).click()
  await join(page, name)
}

test('three people rate, close, rename and lock a room', async ({ browser }) => {
  const ctx = await Promise.all([browser.newContext(), browser.newContext(), browser.newContext()])
  const [a, b, c] = await Promise.all(ctx.map((x) => x.newPage()))
  await Promise.all([a, b, c].map((p) => p.setViewportSize({ width: 390, height: 844 })))

  // 1. A creates "Ice cream" and joins as Ana.
  await a.goto('/')
  await a.getByRole('button', { name: 'Create a room' }).click()
  await a.getByLabel('Room name').fill('Ice cream')
  await a.getByLabel('Entry 1', { exact: true }).fill('1')
  await a.getByRole('button', { name: 'Add entry' }).click()
  await a.getByLabel('Entry 2', { exact: true }).fill('2')
  await a.getByRole('button', { name: 'Add entry' }).click()
  await a.getByLabel('Entry 3', { exact: true }).fill('3')
  await a.getByLabel('Criterion 1', { exact: true }).fill('Smell')
  await a.getByRole('button', { name: 'Add criterion' }).click()
  await a.getByLabel('Criterion 2', { exact: true }).fill('Flavor')
  await a.getByRole('button', { name: 'Create room' }).click()
  await expect(a).toHaveURL(/#\/r\/[A-Z0-9]{6}/)
  const code = /#\/r\/([A-Z0-9]{6})/.exec(a.url())![1]
  await join(a, 'Ana')
  await expect(a.getByText('Waiting room')).toBeVisible()
  await expect(a.getByText(code, { exact: true })).toBeVisible()

  // 2. B and C join with the code in lowercase.
  await joinWithCode(b, code, 'Ben')
  await joinByLink(c, code, 'Cat')
  await expect(b.getByText('Entry 1 of 3')).toBeVisible()
  await expect(c.getByText('Entry 1 of 3')).toBeVisible()
  await expect(a.getByText('Ben', { exact: true })).toBeVisible()
  await expect(a.getByText('Cat')).toBeVisible()

  // 3. B rates everything. C rates entry 1 and skips Smell on entry 2.
  for (let i = 0; i < 3; i++) {
    await pick(b, 'Smell', 7)
    await expect(b.getByTestId('score-value')).toHaveText('7.0')
    await b.getByRole('button', { name: 'Next' }).click()
    await pick(b, 'Flavor', 8)
    await b.getByRole('button', { name: i < 2 ? 'Next' : 'Save' }).click()
  }
  await expect(b.getByText('Waiting room')).toBeVisible()

  await pick(c, 'Smell', 5)
  await c.getByRole('button', { name: 'Next' }).click()
  await pick(c, 'Flavor', 6)
  await expect(c.getByTestId('score-value')).toHaveText('6.0')
  await c.getByRole('button', { name: 'Next' }).click()
  await expect(c.getByText('Entry 2 of 3')).toBeVisible()
  await c.getByRole('button', { name: 'Skip' }).click()
  await expect(c.getByTestId('score-value')).toHaveText('Skipped')
  await c.getByRole('button', { name: 'Next' }).click()
  await pick(c, 'Flavor', 6)
  await c.getByRole('button', { name: 'Next' }).click()
  await expect(c.getByText('Entry 3 of 3')).toBeVisible()

  // A rates entry 1 fully and entry 2 only for Smell, then reloads.
  await a.getByRole('button', { name: 'Edit my ratings' }).click()
  await expect(a.getByText('Entry 1 of 3')).toBeVisible()
  await pick(a, 'Smell', 9)
  await a.getByRole('button', { name: 'Next' }).click()
  await pick(a, 'Flavor', 4)
  await a.getByRole('button', { name: 'Next' }).click()
  await pick(a, 'Smell', 6)
  await expect(a.getByTestId('score-value')).toHaveText('6.0')
  await a.reload()
  await expect(a.getByText('Entry 2 of 3')).toBeVisible()
  await expect(a.getByTestId('score-value')).toHaveText('6.0')
  await a.getByRole('button', { name: /^Criterion 2, / }).click()
  await expect(a.getByTestId('score-value')).toHaveText('-')
  await a.getByRole('button', { name: /^Entry 1, / }).click()
  await expect(a.getByText('Entry 1 of 3')).toBeVisible()
  await expect(a.getByTestId('score-value')).toHaveText('9.0')
  await a.getByRole('button', { name: 'Next' }).click()
  await expect(a.getByTestId('score-value')).toHaveText('4.0')
  await a.getByRole('button', { name: 'Next' }).click()
  await a.getByRole('button', { name: 'Next' }).click()
  await pick(a, 'Flavor', 5)
  await a.getByRole('button', { name: 'Next' }).click()
  await pick(a, 'Smell', 3)
  await a.getByRole('button', { name: 'Next' }).click()
  await pick(a, 'Flavor', 3)
  await a.getByRole('button', { name: 'Save' }).click()
  await expect(a.getByText('Waiting room')).toBeVisible()

  // 4. A removes C.
  await a.getByRole('listitem').filter({ hasText: 'Cat' }).getByRole('button', { name: 'Remove' }).click()
  await a.getByRole('button', { name: 'Remove participant' }).click()
  await expect(c.getByText('You were removed from this room')).toBeVisible()

  // 5. A closes the room. A and B show Preview results. C opens the link again and sees it too.
  await a.getByRole('button', { name: 'Close room and show results' }).click()
  await a.getByRole('button', { name: 'Close room', exact: true }).click()
  await expect(a.getByText('Preview results', { exact: true })).toBeVisible()
  await expect(b.getByText('Preview results', { exact: true })).toBeVisible()
  await c.reload()
  await expect(c.getByText('Preview results', { exact: true })).toBeVisible()

  const rowOne = a.getByRole('button', { name: /^[\d-]+ 1 [\d.-]+$/ })
  const before = await rowOne.textContent()
  await b.getByRole('button', { name: 'Edit my ratings' }).click()
  await expect(b.getByText('Entry 3 of 3')).toBeVisible()
  await b.getByRole('button', { name: /^Entry 1, / }).click()
  await expect(b.getByText('Entry 1 of 3')).toBeVisible()
  await pick(b, 'Smell', 1)
  await expect(b.getByTestId('score-value')).toHaveText('1.0')
  for (let i = 0; i < 5; i++) await b.getByRole('button', { name: 'Next' }).click()
  await b.getByRole('button', { name: 'Save' }).click()
  await expect(b.getByText('Preview results', { exact: true })).toBeVisible()
  await expect.poll(() => rowOne.textContent()).not.toBe(before)

  // 6. A renames entry 1. B sees the new title.
  await a.getByLabel('Edit title of 1').click()
  await a.getByRole('textbox', { name: 'Title' }).fill('Gelato Uno')
  await a.getByRole('button', { name: 'Save' }).click()
  await expect(a.getByText('Gelato Uno')).toBeVisible()
  await expect(b.getByText('Gelato Uno')).toBeVisible()

  // 7. A locks. Everyone shows Final results. B has no edit controls.
  await a.getByRole('button', { name: 'Lock results' }).click()
  await a.getByRole('alertdialog').getByRole('button', { name: 'Lock results' }).click()
  for (const p of [a, b, c]) await expect(p.getByText('Final results', { exact: true })).toBeVisible()
  await expect(b.getByRole('button', { name: 'Edit my ratings' })).toHaveCount(0)
  await expect(b.getByRole('button', { name: /^Edit title/ })).toHaveCount(0)
  await expect(b.getByRole('button', { name: 'Lock results' })).toHaveCount(0)
  await expect(a.getByRole('button', { name: 'Lock results' })).toHaveCount(0)

  await Promise.all(ctx.map((x) => x.close()))
})

import {test, expect} from '@playwright/test';

test.describe("user 测试", () => {
    test.beforeEach(({page}) => {
        page.goto("http://localhost:3000/user");
    })

    test("has title", async ({page}) => {
        await expect(page).toHaveTitle("My user page")
    })

    test("input has initial value", async ({page}) => {
        await expect(page.getByRole('textbox')).toBeVisible()
        await expect(page.getByRole('textbox')).toHaveValue("start")
    })

    test("input has filled value", async ({page}) => {
        page.getByRole('textbox').fill("start start")
        await expect(page.getByRole('textbox')).toBeVisible()
        await expect(page.getByRole('textbox')).toHaveValue("start start")
    })

    test("span has input's value", async ({page}) => {
        await page.getByRole('textbox').fill("hello span")
        await expect(page.getByRole('textbox')).toBeVisible()
        const value = await page.getByRole('textbox').inputValue()
        await expect(page.getByText(value)).toBeVisible()
        await expect(page.getByText('textbox')).toHaveValue("hello span")
    })
})

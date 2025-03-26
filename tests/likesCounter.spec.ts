import {test, expect, request} from '@playwright/test';

test('like counter increase', async({page}) => {
    
  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByText('Global Feed').click()
  const firstLkeButton = page.locator('app-article-preview').first().locator('button')

  await expect(firstLkeButton).toContainText('0')
  await firstLkeButton.click()
  await expect(firstLkeButton).toContainText('1')

})
import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async ({page}) => {
  await page.route('*/**/api/tags', async route =>{
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  
  await page.goto('https://conduit.bondaracademy.com/');
})

test('has title', async ({ page }) => {
  await page.route('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a test title CG"
    responseBody.articles[0].description = "This is a description CG"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })
  
  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title CG')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a description CG')
});

test('delete article', async({page, request}) => {

    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
      data: {
        "article":{"title":"Test title CG","description":"Test description CG","body":"Test body CG","tagList":[]}
      }
    })
    console.log(await articleResponse.json())
    expect(articleResponse.status()).toEqual(201)

    await page.getByText('Global Feed').click()
    await page.getByText('Test title CG').click()
    await page.getByRole('button', {name: "Delete Article"}).first().click()
    await page.getByText('Global Feed').click()

    await expect(page.locator('app-article-list h1').first()).not.toContainText('Test title CG')
  })


  test('create article', async({page, request}) =>{
    await page.getByText('New Article').click()
    await page.getByRole('textbox', {name: 'Article Title'}).fill('Paywright is awesome')
    await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('About the playwright')
    await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('We like to use playwright for automation')
    await page.getByRole('button', {name: 'Publish Article'}).click()
    const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
    const articleResponseBody = await articleResponse.json()
    const slugId = articleResponseBody.article.slug
  
    await expect(page.locator('.article-page h1')).toContainText('Paywright is awesome')

    await page.getByText('Home').click()
    await page.getByText('Global Feed').click()
    await expect(page.locator('app-article-list h1').first()).toContainText('Paywright is awesome')

    const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`)
    expect(deleteArticleResponse.status()).toEqual(204)

    await page.request.delete(`https://conduit-api.bondaracademy.com/api/articles/playwright-is-awesome`, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/',
        accept: '*/*',
        'accept-encoding': 'gzip, deflate, br',
        Authorization: `Token ghhhg65tyjt468j5h14dy58t4ty54ty68j436yj5468j4`,
      }
    });
  })
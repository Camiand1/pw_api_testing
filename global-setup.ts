import { request, expect } from "@playwright/test"
import user from '../pw-api-test-app/.auth/user.json'
import fs from 'fs'


async function globalSetup() {

    const context = await request.newContext()
    const authFile = '.auth/user.json'
    
    const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user": {"email": "testcg12@gmail.com", password: "testcg12"}
        }
      })
  
      const responseBody = await responseToken.json()
      const accessToken = responseBody.user.token
      user.origins[0].localStorage[0].value = accessToken
      fs.writeFileSync(authFile, JSON.stringify(user))

      process.env['ACCESS_TOKEN'] = accessToken

    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles/', {
      data: {
        "article":{"title":"Global Likes test article","description":"Test description CG","body":"Test body CG","tagList":[]}
      },
      headers:{
        Authorization: `Toke ${process.env.ACCESS_TOKEN}`
      }
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
    
}

export default globalSetup
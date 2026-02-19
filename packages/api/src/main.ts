import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  )

  app.enableCors({
    origin: [
      process.env.INSTITUTION_DASHBOARD_URL ?? 'http://localhost:3001',
      process.env.VERIFIER_PORTAL_URL ?? 'http://localhost:3002',
    ],
    credentials: true,
  })

  const port = process.env.PORT ?? 4000
  await app.listen(port)
  console.log(`🚀 Credibly API running on http://localhost:${port}/graphql`)
}

bootstrap()

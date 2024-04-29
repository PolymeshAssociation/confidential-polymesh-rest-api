/* istanbul ignore file */

import { repl } from '@nestjs/core';

// eslint-disable-next-line no-restricted-imports
import { AppModule } from './../app.module';

async function bootstrap(): Promise<void> {
  await repl(AppModule);
}
bootstrap();

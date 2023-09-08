import type { Command, MessageData, RunTestsCommand } from '@cva/shared';
import { assert, expect } from 'chai';
import logger from '@shared/logger';
import { TestRegistry } from './registry';
import { ColorStyleDataSource } from '@code/metadata/dataSource/styles/ColorStyleDataSource';
// import mocha  from './mocha';
// import Mocha, { describe, it } from './mocha';

export enum MochaEvents {
  EVENT_HOOK_BEGIN = 'hook',
  EVENT_HOOK_END = 'hook end',
  EVENT_RUN_BEGIN = 'start',
  EVENT_DELAY_BEGIN = 'waiting',
  EVENT_DELAY_END = 'ready',
  EVENT_RUN_END = 'end',
  EVENT_SUITE_BEGIN = 'suite',
  EVENT_SUITE_END = 'suite end',
  EVENT_TEST_BEGIN = 'test',
  EVENT_TEST_END = 'test end',
  EVENT_TEST_FAIL = 'fail',
  EVENT_TEST_PASS = 'pass',
  EVENT_TEST_PENDING = 'pending',
  EVENT_TEST_RETRY = 'retry',
  STATE_IDLE = 'idle',
  STATE_RUNNING = 'running',
  STATE_STOPPED = 'stopped',
}

// class FigmaPluginReporter extends Mocha.reporters.Base {
//   constructor(runner: Mocha.Runner, private options: Mocha.MochaOptions) {
//     super(runner, options);

//     runner.on(MochaEvents.EVENT_SUITE_BEGIN, function (test: any) {
//       console.log('begin: %s', test.fullTitle());
//     });
//     runner.on(MochaEvents.EVENT_TEST_PASS, function (test: any) {
//       console.log('pass: %s', test.fullTitle());
//     });

//     runner.on(MochaEvents.EVENT_TEST_FAIL, function (test: any, err: any) {
//       console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
//     });

//     runner.on(MochaEvents.EVENT_TEST_END, function () {
//       console.log('end: %d/%d', runner.stats?.passes, runner.stats?.tests);
//     });
//   }
// }

// import * as metadata from '../metadata/dataSource/ColorStyleDataSource.test'
export async function runTests(command: RunTestsCommand) {
  // const mocha = Mocha({
  //   ui: 'bdd',
  // });
  // console.log('mocha', mocha);

  // mocha.reporter(FigmaPluginReporter);

  logger.handlers('Handling DisableNodeVariance', command);
  logger.test('Running tests...');
  logger.test(TestRegistry);

  await TestRegistry.Run(command.pattern);

  // describe('Testing mocha', () => {
  //   it('Should run tests', () => {
  //     assert(true, 'Should run tests');
  //   });
  // });
}

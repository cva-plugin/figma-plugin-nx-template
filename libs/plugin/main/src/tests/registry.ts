import { Event, ITest, MessageBus } from '@cva/shared';

export class TestRegistry {
  static tests: ITest[] = [];

  /**
   * If true, the test runner will stop on the first failed test.
   */
  static FailFast = false;

  public static Add(test: ITest) {
    TestRegistry.tests.push(test);
  }

  /**
   * Run all tests matching the given pattern.
   */
  public static Run(pattern?: string) {
    pattern = pattern ?? '.*';
    const regex = new RegExp(pattern);
    Promise.all(
      TestRegistry.tests
        .filter((test) => regex.test(test.name))
        .map((test) => {
          // @TODO: check

          test
            .run()

            .then((result) => {
              if (
                TestRegistry.FailFast &&
                result.assertions.some((assertion) => !assertion.passed)
              ) {
                throw new Error('Tests failed');
              }
              //Message test pass
              MessageBus.publishEvent(Event.TestPassed, result.assertions);
            });
        })
    ).catch((error) => {
      //Message test failed
      MessageBus.publishEvent(Event.TestFailed, error);

      console.error(error);
    });
    // Message test ended
    MessageBus.publishEvent(Event.TestsEnded, true);
  }
}

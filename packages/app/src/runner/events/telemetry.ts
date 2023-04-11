import { telemetry } from '@packages/telemetry/src/browser'

export const addTelemetryListeners = (Cypress) => {
  Cypress.on('test:before:run', (attributes, test) => {
    // we emit the 'test:before:run' events within various driver tests
    try {
      // If a span for a previous test hasn't been ended, end it before starting the new test span
      const previousTestSpan = telemetry.findActiveSpan((span) => {
        return span.name.startsWith('test:')
      })

      if (previousTestSpan) {
        telemetry.endActiveSpanAndChildren(previousTestSpan)
      }

      const span = telemetry.startSpan({ name: `test:${test.fullTitle()}`, active: true })

      span?.setAttributes({
        currentRetry: attributes.currentRetry,
      })
    } catch (error) {
      // TODO: log error when client side debug logging is available
    }
  })

  Cypress.on('test:after:run', (attributes, test) => {
    try {
      const span = telemetry.getSpan(`test:${test.fullTitle()}`)

      span?.setAttributes({
        timings: JSON.stringify(attributes.timings),
      })

      span?.end()
    } catch (error) {
      // TODO: log error when client side debug logging is available
    }
  })

  Cypress.on('command:start', (command) => {
    const runnable = Cypress.state('runnable')

    const runnableType = runnable.type === 'hook' ? runnable.hookName : runnable.type

    const span = telemetry.startSpan({
      name: `${runnableType}: ${command.attributes.name}(${command.attributes.args.join(',')})`,
    })

    span?.setAttribute('command-name', command.attributes.name)
    span?.setAttribute('runnable-type', command.attributes.runnableType)
  })

  Cypress.on('command:end', (command) => {
    const runnable = Cypress.state('runnable')

    const runnableType = runnable.type === 'hook' ? runnable.hookName : runnable.type

    const span = telemetry.getSpan(`${runnableType}: ${command.attributes.name}(${command.attributes.args.join(',')})`)

    span?.setAttribute('state', command.state)
    span?.setAttribute('numLogs', command.logs?.length || 0)
    span?.end()
  })
}

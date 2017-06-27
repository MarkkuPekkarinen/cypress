const rawRender = require('../raw_render')

/* eslint-disable quotes */
const urls = {
  action: `{% url 'actionable state' interacting-with-elements %}`,
  exist: `{% url 'exist in the DOM' introduction-to-cypress#Default-Assertions %}`,
}

module.exports = function yields (hexo, args) {
  // {% timeouts assertions .blur %}
  // {% timeouts actions .check %}
  // {% timeouts existence cy.get %}
  // {% timeouts automation cy.clearCookie %}
  // {% timeouts none .debug %}

  const type = args[0]
  const cmd = `<code>${args[1]}()</code>`

  const assertion = `${cmd} can time out waiting for assertions you've added to pass`

  const render = (str) => {
    return rawRender.call(this, hexo, str)
  }

  const assertions = () => {
    return `<ul>
      <li><p>${assertion}.</p></li>
    </ul>`
  }

  const actions = () => {
    return render(`<ul>
      <li><p>${cmd} can time out waiting for the element to reach an ${urls.action}.</p></li>
      <li><p>${assertion}.</p></li>
    </ul>`)
  }

  const existence = () => {
    return render(`<ul>
      <li><p>${cmd} can time out waiting for the element(s) to ${urls.exist}.</p></li>
      <li><p>${assertion}.</p></li>
    </ul>`)
  }

  const automation = () => {
    return render(`<ul>
      <li><p>${cmd} should never time out.</p></li>
      </ul>
      {% note warning %}
      Because ${cmd} is asynchronous it is technically possible for there to be a time out while talking to the internal Cypress automation API's. But for practical purposes it should never happen.
      {% endnote %}`)
  }

  const its = () => {
    return `<ul>
      <li><p>${cmd} can time out waiting for the property to exist.</p></li>
      <li><p>${assertion}.</p></li>
    </ul>`
  }

  const exec = () => {
    return `<ul>
      <li><p>${cmd} can time out waiting for the system command to exit.</p></li>
    </ul>`
  }

  const none = () => {
    return `<ul>
      <li><p>${cmd} can not time out.</p></li>
    </ul>`
  }

  const page = () => {
    return `<ul>
    <li><p>${cmd} can time out waiting for the page to fire its <code>load</code> event.</p></li>
    <li><p>${assertion}.</p></li>
    </ul>`
  }

  switch (type) {
    case 'assertions':
      return assertions()
    case 'actions':
      return actions()
    case 'existence':
      return existence()
    case 'automation':
      return automation()
    case 'its':
      return its()
    case 'exec':
      return exec()
    case 'none':
      return none()
    case 'page':
      return page()
    default:
      // error when an invalid usage option was provided
      throw new Error(`{% timeouts %} tag helper was provided an invalid option: ${type}`)
  }
}

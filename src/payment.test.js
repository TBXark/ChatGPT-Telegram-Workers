import test from 'ava'
import { extractActivationCode } from './payment.js'

test('(extractActivationCode) Should correctly extract the code', (t) => {
  t.is(extractActivationCode('Activation code: qwerty'), 'qwerty')
  t.is(extractActivationCode('Activation code:'), null)
  t.is(extractActivationCode('Activation code: my code'), 'my code')
  t.is(
    extractActivationCode(
      'Activation code: a7c01893fac1d2a92ab093c85b5b11258f26be9b40199e8cf787f545d61723cfa8935e74e82391a26bb2472f65dcf621656ff625fe31b5d7a26054f85762ae15',
    ),
    'a7c01893fac1d2a92ab093c85b5b11258f26be9b40199e8cf787f545d61723cfa8935e74e82391a26bb2472f65dcf621656ff625fe31b5d7a26054f85762ae15',
  )
  t.is(
    extractActivationCode(`
    Activation code:
    qwerty123
  `),
    'qwerty123',
  )
  t.is(
    extractActivationCode(`
  Activation code:
  Some 2nd code
`),
    'Some 2nd code',
  )
})

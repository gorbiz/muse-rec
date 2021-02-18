const osc = require('osc-min')
const udp = require('dgram')

const derp = {}
const sock = udp.createSocket('udp4', function(msg, rinfo) {
  try {
    const data = osc.fromBuffer(msg)
    data.elements.map(element => {
      derp[element.address] = element.args.map(arg => arg.value)
    })
    return
  } catch (error) {
    return console.log('invalid OSC packet', error)
  }
});

let last = 0
setInterval(() => {
  process.stdout.write('\033c')
  last = 0
  for (const [key, val] of Object.entries(derp)) {
    process.stdout.write(`${key.replace('/elements/', '/')}:\t ${val.join(', \t')}\n`)
    last++
  }
}, 100)

sock.bind(7980)

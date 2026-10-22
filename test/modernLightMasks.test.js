/* eslint-env mocha */
const assert = require('assert')
const BitArray = require('../src/pc/common/BitArrayNoSpan')

describe('26.3 light masks', () => {
  it('reads little-endian bits across byte and word boundaries', () => {
    const bytes = [0x81, 0x01, 0x80, 0x00, 0x01]
    const mask = BitArray.fromByteArray(bytes, 1)
    for (let i = 0; i < 40; i++) assert.strictEqual(mask.get(i), [0, 7, 8, 23, 32].includes(i) ? 1 : 0)
    assert.deepStrictEqual(mask.toByteArray(), bytes)
    assert.deepStrictEqual(BitArray.fromByteArray([], 1).toByteArray(), [])
  })

  for (const version of ['1.18.2', '26.1', '26.2', '26.3']) {
    it(`round trips block and sky light on ${version}`, () => {
      const Chunk = require('../')(version)
      const chunk = new Chunk({ minY: -64, worldHeight: 384 })
      const pos = require('vec3')(1, -48, 2)
      chunk.setBlockLight(pos, 13)
      chunk.setSkyLight(pos, 11)
      const light = chunk.dumpLight()
      const restored = new Chunk({ minY: -64, worldHeight: 384 })
      restored.loadParsedLight(light.skyLight, light.blockLight, light.skyLightMask, light.blockLightMask, light.emptySkyLightMask, light.emptyBlockLightMask)
      assert.strictEqual(restored.getBlockLight(pos), 13)
      assert.strictEqual(restored.getSkyLight(pos), 11)
      const empty = new Chunk({ minY: -64, worldHeight: 384 }).dumpLight()
      restored.loadParsedLight(empty.skyLight, empty.blockLight, empty.skyLightMask, empty.blockLightMask, empty.emptySkyLightMask, empty.emptyBlockLightMask)
    })
  }
})

import {CodeKeywordDefinition, KeywordCxt, JSONSchemaType, Name} from "ajv"
import {_} from "ajv/dist/compile/codegen"
import {usePattern} from "./_util"

interface RegexpSchema {
  pattern: string
  flags?: string
}

const regexpMetaSchema: JSONSchemaType<RegexpSchema> = {
  type: "object",
  properties: {
    pattern: {type: "string"},
    flags: {type: "string", nullable: true},
  },
  required: ["pattern"],
  additionalProperties: false,
}

const metaRegexp = /^\/(.*)\/([gimuy]*)$/

export default function getDef(): CodeKeywordDefinition {
  return {
    keyword: "regexp",
    type: "string",
    schemaType: ["string", "object"],
    code(cxt: KeywordCxt) {
      const {gen, data, schema} = cxt
      const regx = getRegExp(schema)
      cxt.pass(_`${regx}.test(${data})`)

      function getRegExp(sch: string | RegexpSchema): Name {
        if (typeof sch == "object") return usePattern(gen, sch.pattern, sch.flags)
        const rx = metaRegexp.exec(sch)
        if (rx) return usePattern(gen, rx[1], rx[2])
        throw new Error("cannot parse string into RegExp")
      }
    },
    metaSchema: {
      anyOf: [{type: "string"}, regexpMetaSchema],
    },
  }
}

module.exports = getDef

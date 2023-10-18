import * as yup from "yup"

// stolen from https://regexland.com/base64/
const base64Regex = /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?$/

const fileSchema = yup.object({
    name: yup.string()
        .required(),
    content: yup.string()
        .matches(base64Regex)
        .required()
})

export const vulnerabilityDecryptionSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().required(),
    cve: yup.string()
        .nullable()
        .optional(),
    file: fileSchema
        .nullable()
        .optional(),
}).required()
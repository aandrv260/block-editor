import { assertEngineError } from "../../errors/test-utils/error-test.utils";
import { InvalidDocumentJSONError } from "../errors/factories";
import { parseDocumentJSON } from "./json-utils";

describe("parseJSON()", () => {
  test.each([
    [
      `{"id": "1", "type": "text", "data": { "text": "some_text" }}`,
      { id: "1", type: "text", data: { text: "some_text" } },
    ],
    [`{}`, {}],
    [
      `[{ "id": "1", "type": "text", "data": { "text": "some_text" } }]`,
      [{ id: "1", type: "text", data: { text: "some_text" } }],
    ],
    [
      `{"id": "1", "type": "text", "data": { "text": "some_text" }, "children": [{"id": "2", "type": "text", "data": { "text": "some_text" }}]}`,
      {
        id: "1",
        type: "text",
        data: { text: "some_text" },
        children: [{ id: "2", type: "text", data: { text: "some_text" } }],
      },
    ],
  ])("returns the parsed JSON if the JSON passed is %s", (json, expected) => {
    // Assert
    expect(parseDocumentJSON(json)).toEqual(expected);
  });

  test.each([
    ['{"id": "1", "type": "text", "data: { "text": "some_text" }'],
    ["1e"],
    [`{ id: "1", type: "text", data: { text: "some_text", }, }`],
  ])("throws an error if the JSON passed is invalid - %s", json => {
    // Arrange
    const tryParse = () => parseDocumentJSON(json);

    // Assert
    assertEngineError(tryParse, {
      ExpectedErrorClass: InvalidDocumentJSONError,
      expectedCode: "DOCUMENT:INVALID_DOCUMENT_JSON",
      expectedMessage: "Invalid JSON format — cannot parse document.",
    });
  });
});

import { getObjectEntries } from "./object.utils";

describe("getObjectEntries()", () => {
  it("returns every own key and value pair in insertion order", () => {
    // Arrange
    const object = { first: 1, second: "two" };

    // Act
    const entries = getObjectEntries(object);

    // Assert
    expect(entries).toStrictEqual([
      ["first", 1],
      ["second", "two"],
    ]);
  });

  it("returns an empty array for an empty object", () => {
    // Act and assert
    expect(getObjectEntries({})).toStrictEqual([]);
  });
});

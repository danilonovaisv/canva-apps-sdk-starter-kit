const {
  createCodeChallenge,
  createRandomString,
  parsePages,
  parseScopes,
} = require("../lib/security.js");

describe("Canva backend security helpers", () => {
  test("uses design content read as the default OAuth scope", () => {
    expect(parseScopes(undefined)).toEqual(["design:content:read"]);
  });

  test("parses comma and whitespace separated OAuth scopes", () => {
    expect(
      parseScopes("design:content:read, design:content:write asset:read"),
    ).toEqual([
      "design:content:read",
      "design:content:write",
      "asset:read",
    ]);
  });

  test("creates PKCE strings suitable for Canva OAuth", () => {
    const verifier = createRandomString();
    const challenge = createCodeChallenge(verifier);

    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("accepts valid PPTX page selections", () => {
    expect(parsePages([1, 2, 10])).toEqual([1, 2, 10]);
    expect(parsePages(undefined)).toBeUndefined();
  });

  test("rejects invalid PPTX page selections", () => {
    expect(() => parsePages([0])).toThrow("positive integers");
    expect(() => parsePages(["1"])).toThrow("positive integers");
  });
});

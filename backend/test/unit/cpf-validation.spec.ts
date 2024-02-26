import { isValidCpf } from "../../src/cpf-validation";

describe("CpfValidation", () => {
  describe("isValidCpf", () => {
    it.each(["97456321558", "71428793860", "87748248800"])(
      "should return false when cpf is valid: %s",
      function (cpf: string) {
        const isValid = isValidCpf(cpf);
        expect(isValid).toBe(true);
      }
    );

    it.each(["8774824880", null, undefined, "11111111111"])(
      "should return false when cpf is invalid: %s",
      function (cpf: any) {
        const isValid = isValidCpf(cpf);
        expect(isValid).toBe(false);
      }
    );
  });
});

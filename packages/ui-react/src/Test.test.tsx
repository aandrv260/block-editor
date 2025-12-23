import { render, screen } from "@testing-library/react";
import { Test } from "./Test";

describe("Test", () => {
  it("renders properly", () => {
    render(<Test />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});

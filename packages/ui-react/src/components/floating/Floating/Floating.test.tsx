import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Floating from "./Floating";

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe("Floating", () => {
  it("renders the content if open is true", () => {
    // Act
    render(
      <Floating role="menu" open={true}>
        <div>Floating content</div>
      </Floating>,
    );

    // Assert
    const menu = screen.getByRole("menu");

    expect(menu).toHaveAttribute("tabindex", "0");
    expect(within(menu).getByText("Floating content")).toBeInTheDocument();
  });

  it("passes the correct aria attributes to the floating element", () => {
    // Act
    render(
      <Floating role="menu" open={true} aria-label="Floating menu">
        <div>Floating content</div>
      </Floating>,
    );

    // Assert
    expect(
      screen.getByRole("menu", {
        name: "Floating menu",
      }),
    ).toBeInTheDocument();
  });

  it("does not render the content if open is false", () => {
    // Act
    render(
      <Floating open={false}>
        <div>Floating content</div>
      </Floating>,
    );

    // Assert
    expect(screen.queryByText("Floating content")).not.toBeInTheDocument();
  });

  it("closes the floating element on outside click", () => {
    // Arrange
    const onChangeOpen = vi.fn();

    // Act
    render(
      <div>
        <button>Outside button</button>
        <Floating open={true} onChangeOpen={onChangeOpen}>
          <div>Floating content</div>
        </Floating>
      </div>,
    );

    // Assert
    expect(screen.getByText("Floating content")).toBeInTheDocument();

    // Act
    const outsideButton = screen.getByText("Outside button");
    fireEvent.click(outsideButton);

    // Assert
    expect(onChangeOpen).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("unmounts if open is changed to false", () => {
    // Act
    const { rerender } = render(
      <Floating open={true}>
        <div>Floating content</div>
      </Floating>,
    );

    // Assert
    expect(screen.getByText("Floating content")).toBeInTheDocument();

    // Act
    rerender(
      <Floating open={false}>
        <div>Floating content</div>
      </Floating>,
    );

    // Assert
    expect(screen.queryByText("Floating content")).not.toBeInTheDocument();
  });
});

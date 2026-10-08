import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} totalItems={0} pageSize={10} onChange={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the correct item range and page count", () => {
    render(<Pagination page={2} totalPages={3} totalItems={22} pageSize={10} onChange={() => {}} />);
    expect(screen.getByText("11–20 of 22")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
  });

  it("clamps the displayed end of the range to the total on a partial last page", () => {
    render(<Pagination page={3} totalPages={3} totalItems={22} pageSize={10} onChange={() => {}} />);
    expect(screen.getByText("21–22 of 22")).toBeInTheDocument();
  });

  it("disables Prev on the first page and Next on the last page", () => {
    render(<Pagination page={1} totalPages={3} totalItems={22} pageSize={10} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("calls onChange with the adjacent page when Next/Prev are clicked", async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={3} totalItems={22} pageSize={10} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onChange).toHaveBeenCalledWith(3);

    await userEvent.click(screen.getByRole("button", { name: /prev/i }));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

"use client";

import TablePagination from "@mui/material/TablePagination";

export type ProjectsPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

/**
 * Pagination control for the projects list.
 * API pages are 1-based; MUI TablePagination uses 0-based `page`.
 */
export function ProjectsPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: ProjectsPaginationProps) {
  if (total <= 0) {
    return null;
  }

  return (
    <TablePagination
      component="div"
      count={total}
      page={Math.max(0, page - 1)}
      onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
      rowsPerPage={pageSize}
      onRowsPerPageChange={(event) => {
        onPageSizeChange(Number.parseInt(event.target.value, 10));
      }}
      rowsPerPageOptions={[10, 20, 50]}
      labelRowsPerPage="Rows"
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        ".MuiToolbar-root": {
          flexWrap: "wrap",
          gap: 1,
          pl: { xs: 1, sm: 2 },
          pr: { xs: 1, sm: 2 },
        },
      }}
    />
  );
}

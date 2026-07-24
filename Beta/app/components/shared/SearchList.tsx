"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { normalize } from "@/app/utils/string";

interface SearchListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  searchFields: (keyof T)[];
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  icon?: ReactNode;
}

export function SearchList<T extends { id: string }>({
  items,
  renderItem,
  searchFields,
  placeholder = "Buscar...",
  emptyTitle = "Sin resultados",
  emptyDescription = "No encontramos resultados para esa búsqueda.",
  icon,
}: SearchListProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  const normalizedQuery = normalize(query.trim());

  const filtered = items.filter((item) => {
    if (!normalizedQuery) return true;
    return searchFields.some((field) => {
      const value = item[field];
      return typeof value === "string" && normalize(value).includes(normalizedQuery);
    });
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(0);
  };

  return (
    <div className="space-y-5">
      <label className="relative block">
        <span className="sr-only">{placeholder}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          className="field-input rounded-3xl pl-11"
          placeholder={placeholder}
          value={query}
          onChange={(event) => handleSearch(event.target.value)}
        />
      </label>

      <p className="text-sm font-bold text-text-muted">
        {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
      </p>

      {paginated.length === 0 ? (
        <EmptyState
          description={items.length === 0 ? emptyDescription : "No encontramos resultados para esa búsqueda."}
          icon={icon}
          title={emptyTitle}
        />
      ) : (
        <>{paginated.map(renderItem)}</>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            className="secondary-button rounded-xl px-4 py-2 text-sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            type="button"
          >
            Anterior
          </button>
          <span className="text-sm font-bold text-text-muted">
            {page + 1} de {totalPages}
          </span>
          <button
            className="secondary-button rounded-xl px-4 py-2 text-sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            type="button"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

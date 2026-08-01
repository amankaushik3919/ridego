"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldX, ShieldCheck, ChevronDown } from "lucide-react";
import { adminApi, RiderSummary } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const PAGE_SIZES = [10, 20, 50];

export default function AdminRidersPage() {
  const [items, setItems] = useState<RiderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingBlock, setPendingBlock] = useState<RiderSummary | null>(null);
  const [blocking, setBlocking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.riders(page, limit, query);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load riders."));
    } finally {
      setLoading(false);
    }
  }, [page, limit, query]);

  useEffect(() => {
    const id = setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const confirmBlock = async () => {
    if (!pendingBlock) return;
    setBlocking(true);
    try {
      if (pendingBlock.isActive) {
        await adminApi.blockUser(pendingBlock.userId);
        toast.success(`${pendingBlock.name ?? pendingBlock.phone} blocked.`);
      } else {
        await adminApi.unblockUser(pendingBlock.userId);
        toast.success(`${pendingBlock.name ?? pendingBlock.phone} unblocked.`);
      }
      setPendingBlock(null);
      void load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status."));
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Riders</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 sm:w-64"
            placeholder="Search name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setQuery(search.trim());
                setPage(1);
              }
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-muted-foreground/20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No riders found.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Total Rides</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((r) => (
                    <TableRow key={r.userId} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="font-medium">{r.name ?? r.phone}</div>
                        <div className="text-xs text-muted-foreground">{r.phone}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {r.totalRides}
                      </TableCell>
                      <TableCell>
                        {r.isActive ? (
                          <Badge className="bg-emerald-500 text-white">Active</Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white">Blocked</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={r.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => setPendingBlock(r)}
                        >
                          {r.isActive ? <ShieldX className="size-4" /> : <ShieldCheck className="size-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {items.map((r) => (
              <Card key={r.userId}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{r.name ?? r.phone}</div>
                      <div className="text-xs text-muted-foreground">{r.phone}</div>
                    </div>
                    {r.isActive ? (
                      <Badge className="bg-emerald-500 text-white">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white">Blocked</Badge>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2 text-center text-xs">
                    <div>
                      <div className="font-semibold">{r.totalRides}</div>
                      <div className="text-muted-foreground">Total rides</div>
                    </div>
                    <div>
                      <div className="font-semibold">{formatDate(r.createdAt)}</div>
                      <div className="text-muted-foreground">Joined</div>
                    </div>
                  </div>
                  <Button
                    variant={r.isActive ? "destructive" : "default"}
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => setPendingBlock(r)}
                  >
                    {r.isActive ? "Block rider" : "Unblock rider"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Showing {startItem}–{endItem}
              </span>
              <span>of {total}</span>
              <span className="text-muted-foreground/50">|</span>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px] gap-1 text-xs">
                  <SelectValue />
                  <ChevronDown className="size-3" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>rows/page</span>
            </div>

            {totalPages > 1 ? (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {pageNumbers.map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </div>
        </>
      )}

      {/* Block/unblock confirm */}
      <AlertDialog open={!!pendingBlock} onOpenChange={(v) => !v && setPendingBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingBlock?.isActive ? "Block this rider?" : "Unblock this rider?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBlock?.isActive
                ? `${pendingBlock?.name ?? pendingBlock?.phone} block karne par wo login aur rides nahi kar payega.`
                : `${pendingBlock?.name ?? pendingBlock?.phone} ko unblock kar dega.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={blocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmBlock();
              }}
              disabled={blocking}
              className={pendingBlock?.isActive ? "bg-red-500 text-white hover:bg-red-600" : ""}
            >
              {blocking
                ? "Processing..."
                : pendingBlock?.isActive
                  ? "Block"
                  : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

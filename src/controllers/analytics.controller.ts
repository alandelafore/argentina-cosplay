import { Request, Response } from "express";
import { ProductView, SearchLog } from "../models/mongo/analytics.models";

export async function productMetrics(req: Request, res: Response) {
  const topProducts = await ProductView.aggregate([
    { $group: { _id: "$productId", views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: 10 },
  ]);

  return res.json({ topProducts });
}

export async function searchMetrics(req: Request, res: Response) {
  const topQueries = await SearchLog.aggregate([
    { $group: { _id: "$query", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return res.json({ topQueries });
}

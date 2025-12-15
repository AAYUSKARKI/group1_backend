import { Job } from "bullmq";
import { AuditLogRepository } from "@/api/auditlog/auditlogRepository";

export const createAuditLog = async (job: Job) => {
  const auditLogRepository = new AuditLogRepository();
  await auditLogRepository.createAuditLog(job.data);
};   
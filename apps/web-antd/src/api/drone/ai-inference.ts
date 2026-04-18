/**
 * 在线检测 / 推理任务 API 占位（DEV_PLAN P1-5）。
 */
// import { defHttp } from '#/api/request';

export interface InferenceJobPayload {
  modelId: string;
  sourceType: 'image' | 'video' | 'stream';
  spectralBand?: 'visible' | 'infrared' | 'multispectral';
}

export interface InferenceJobResult {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  resultUrl?: string;
  errorMsg?: string;
  createdAt: string;
}

/** @example return defHttp.post('/uav/ai/inference/jobs', data); */
export async function submitInferenceJob(
  _payload: InferenceJobPayload,
): Promise<{ jobId: string }> {
  void _payload;
  return Promise.reject(
    new Error('DRONE_API: 在线推理任务接口尚未接入'),
  );
}

/** @example return defHttp.get('/uav/ai/inference/jobs/:jobId'); */
export async function getInferenceJobStatus(
  _jobId: string,
): Promise<InferenceJobResult> {
  void _jobId;
  return Promise.reject(
    new Error('DRONE_API: 推理任务状态查询接口尚未接入'),
  );
}

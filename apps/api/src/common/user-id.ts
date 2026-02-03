import { BadRequestException } from '@nestjs/common';

export function requireUserId(value: string | string[] | undefined) {
  const userId = Array.isArray(value) ? value[0] : value;
  if (!userId || !userId.trim()) {
    throw new BadRequestException('X-User-Id header is required');
  }
  return userId.trim();
}

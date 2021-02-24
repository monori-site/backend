/**
 * Copyright (c) 2020-2021 Arisu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* eslint-disable camelcase */

import { prisma, SnowflakeService } from '..';
import { ContainerEntity } from '../di/Container';
import { Service } from '../di/Inject';

export enum AuditLogEntryType {
  Test = 1 << 0
}

export type AuditLogRelation = 'Organization' | 'Project' | 'User';

export default class AuditLogController implements ContainerEntity {
  @Service('snowflake')
  private snowflake!: SnowflakeService;

  public name = 'AuditLogs';

  async create(type: AuditLogEntryType, targetID: string, relation: AuditLogRelation) {
    const id = await this.snowflake.generate();

    return prisma.auditLogs.create({
      data: {
        target_id: targetID,
        relation,
        type,
        id
      }
    });
  }

  async findByRelation(relation: AuditLogRelation) {
    return prisma.auditLogs.findMany({
      where: {
        relation
      }
    });
  }
}

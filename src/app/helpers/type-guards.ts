import { ActionRow, ActionURLRow } from '../contracts';

export function isActionRow(value?: unknown): value is ActionRow {
    const row = value as ActionRow;

    return row != null && row.rowType === 'actionRow';
}

export function isActionUrlRow(value?: unknown): value is ActionURLRow {
    const row = value as ActionURLRow;

    return row != null && row.rowType === 'actionURLRow';
}

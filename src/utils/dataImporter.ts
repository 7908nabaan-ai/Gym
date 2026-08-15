import { ProgressLogEntry } from '../types';

export interface ParseResult {
  success: boolean;
  entries: ProgressLogEntry[];
  errors: string[];
  columnMappingsDetected: Record<string, string>;
}

export function parseCSV(csvContent: string): ParseResult {
  const errors: string[] = [];
  const entries: ProgressLogEntry[] = [];
  const columnMappings: Record<string, string> = {};

  if (!csvContent || !csvContent.trim()) {
    return { success: false, entries: [], errors: ['CSV content is empty'], columnMappingsDetected: {} };
  }

  const lines = csvContent.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { success: false, entries: [], errors: ['CSV must have a header line and at least one data row'], columnMappingsDetected: {} };
  }

  // Parse header line
  const rawHeaders = lines[0].split(/,|;|\t/).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  
  // Normalize header mapping
  const fieldMap: Record<string, number> = {};
  rawHeaders.forEach((header, index) => {
    if (header.includes('date') || header === 'day' || header === 'time') {
      fieldMap['date'] = index;
      columnMappings['date'] = header;
    } else if (header.includes('weight') || header === 'wt' || header === 'bw' || header.includes('kg') || header.includes('lbs')) {
      fieldMap['weightKg'] = index;
      columnMappings['weightKg'] = header;
    } else if (header.includes('fat') || header === 'bf' || header === 'bf%' || header === 'bodyfat') {
      fieldMap['bodyFatPercentage'] = index;
      columnMappings['bodyFatPercentage'] = header;
    } else if (header.includes('lbm') || header.includes('lean') || header.includes('ffm')) {
      fieldMap['leanBodyMassKg'] = index;
      columnMappings['leanBodyMassKg'] = header;
    } else if (header.includes('cal') || header.includes('kcal') || header.includes('energy')) {
      fieldMap['caloriesConsumed'] = index;
      columnMappings['caloriesConsumed'] = header;
    } else if (header.includes('protein') || header === 'pro') {
      fieldMap['proteinGrams'] = index;
      columnMappings['proteinGrams'] = header;
    } else if (header.includes('arm') || header.includes('bicep')) {
      fieldMap['armCm'] = index;
      columnMappings['armCm'] = header;
    } else if (header.includes('chest') || header.includes('pec')) {
      fieldMap['chestCm'] = index;
      columnMappings['chestCm'] = header;
    } else if (header.includes('waist') || header.includes('abdomen')) {
      fieldMap['waistCm'] = index;
      columnMappings['waistCm'] = header;
    } else if (header.includes('thigh') || header.includes('quad')) {
      fieldMap['thighCm'] = index;
      columnMappings['thighCm'] = header;
    } else if (header.includes('calf') || header.includes('calves')) {
      fieldMap['calfCm'] = index;
      columnMappings['calfCm'] = header;
    } else if (header.includes('bench')) {
      fieldMap['benchPressKg'] = index;
      columnMappings['benchPressKg'] = header;
    } else if (header.includes('squat')) {
      fieldMap['squatKg'] = index;
      columnMappings['squatKg'] = header;
    } else if (header.includes('deadlift') || header === 'dl') {
      fieldMap['deadliftKg'] = index;
      columnMappings['deadliftKg'] = header;
    } else if (header.includes('ohp') || header.includes('press') || header.includes('shoulder')) {
      fieldMap['overheadPressKg'] = index;
      columnMappings['overheadPressKg'] = header;
    } else if (header.includes('note') || header.includes('comment') || header.includes('memo')) {
      fieldMap['notes'] = index;
      columnMappings['notes'] = header;
    }
  });

  // If weight column wasn't explicitly named, fallback to second column if numeric
  if (fieldMap['weightKg'] === undefined && rawHeaders.length >= 2) {
    fieldMap['weightKg'] = 1;
    columnMappings['weightKg'] = rawHeaders[1];
  }
  if (fieldMap['date'] === undefined) {
    fieldMap['date'] = 0;
    columnMappings['date'] = rawHeaders[0];
  }

  // Parse rows
  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(/,|;|\t/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (rawCols.length === 0 || (rawCols.length === 1 && !rawCols[0])) continue;

    const dateVal = fieldMap['date'] !== undefined && rawCols[fieldMap['date']] 
      ? rawCols[fieldMap['date']] 
      : new Date(Date.now() - (lines.length - i) * 86400000 * 7).toISOString().split('T')[0];

    const rawWeight = fieldMap['weightKg'] !== undefined ? parseFloat(rawCols[fieldMap['weightKg']]) : NaN;
    if (isNaN(rawWeight)) {
      errors.push(`Row ${i + 1}: Missing or invalid weight number`);
      continue;
    }

    // Auto-detect if weights are in lbs (> 120 and average human scale for bodybuilding)
    // We assume default metric kg, but if > 115 and body fat / height suggests lbs, we note it or convert.
    // However, keeping numeric values standard:
    let weightKg = rawWeight;

    const bfVal = fieldMap['bodyFatPercentage'] !== undefined ? parseFloat(rawCols[fieldMap['bodyFatPercentage']]) : undefined;
    const lbmVal = fieldMap['leanBodyMassKg'] !== undefined ? parseFloat(rawCols[fieldMap['leanBodyMassKg']]) : (bfVal ? weightKg * (1 - bfVal / 100) : undefined);
    const calVal = fieldMap['caloriesConsumed'] !== undefined ? parseFloat(rawCols[fieldMap['caloriesConsumed']]) : undefined;
    const proVal = fieldMap['proteinGrams'] !== undefined ? parseFloat(rawCols[fieldMap['proteinGrams']]) : undefined;

    const entry: ProgressLogEntry = {
      id: `import_${Date.now()}_${i}`,
      date: dateVal,
      weightKg: Math.round(weightKg * 10) / 10,
      bodyFatPercentage: bfVal && !isNaN(bfVal) ? Math.round(bfVal * 10) / 10 : undefined,
      leanBodyMassKg: lbmVal && !isNaN(lbmVal) ? Math.round(lbmVal * 10) / 10 : undefined,
      caloriesConsumed: calVal && !isNaN(calVal) ? Math.round(calVal) : undefined,
      proteinGrams: proVal && !isNaN(proVal) ? Math.round(proVal) : undefined,
      armCm: fieldMap['armCm'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['armCm']])) ? parseFloat(rawCols[fieldMap['armCm']]) : undefined,
      chestCm: fieldMap['chestCm'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['chestCm']])) ? parseFloat(rawCols[fieldMap['chestCm']]) : undefined,
      waistCm: fieldMap['waistCm'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['waistCm']])) ? parseFloat(rawCols[fieldMap['waistCm']]) : undefined,
      thighCm: fieldMap['thighCm'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['thighCm']])) ? parseFloat(rawCols[fieldMap['thighCm']]) : undefined,
      calfCm: fieldMap['calfCm'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['calfCm']])) ? parseFloat(rawCols[fieldMap['calfCm']]) : undefined,
      benchPressKg: fieldMap['benchPressKg'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['benchPressKg']])) ? parseFloat(rawCols[fieldMap['benchPressKg']]) : undefined,
      squatKg: fieldMap['squatKg'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['squatKg']])) ? parseFloat(rawCols[fieldMap['squatKg']]) : undefined,
      deadliftKg: fieldMap['deadliftKg'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['deadliftKg']])) ? parseFloat(rawCols[fieldMap['deadliftKg']]) : undefined,
      overheadPressKg: fieldMap['overheadPressKg'] !== undefined && !isNaN(parseFloat(rawCols[fieldMap['overheadPressKg']])) ? parseFloat(rawCols[fieldMap['overheadPressKg']]) : undefined,
      notes: fieldMap['notes'] !== undefined ? rawCols[fieldMap['notes']] : undefined,
    };

    entries.push(entry);
  }

  return {
    success: entries.length > 0,
    entries,
    errors,
    columnMappingsDetected: columnMappings,
  };
}

export function parseJSON(jsonContent: string): ParseResult {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(jsonContent);
    const rawList = Array.isArray(parsed) ? parsed : (parsed.logs || parsed.data || parsed.entries || [parsed]);

    if (!Array.isArray(rawList) || rawList.length === 0) {
      return { success: false, entries: [], errors: ['No valid log list found in JSON'], columnMappingsDetected: {} };
    }

    const entries: ProgressLogEntry[] = rawList.map((item: any, idx: number) => {
      const weight = parseFloat(item.weightKg || item.weight || item.wt || item.bw || 75);
      const bf = parseFloat(item.bodyFatPercentage || item.bodyFat || item.bf || item.fatPercentage || 15);
      const lbm = item.leanBodyMassKg ? parseFloat(item.leanBodyMassKg) : (weight * (1 - bf / 100));

      return {
        id: item.id || `json_import_${Date.now()}_${idx}`,
        date: item.date || item.day || new Date().toISOString().split('T')[0],
        weightKg: Math.round(weight * 10) / 10,
        bodyFatPercentage: isNaN(bf) ? undefined : Math.round(bf * 10) / 10,
        leanBodyMassKg: isNaN(lbm) ? undefined : Math.round(lbm * 10) / 10,
        caloriesConsumed: item.caloriesConsumed || item.calories || item.kcals ? Math.round(item.caloriesConsumed || item.calories || item.kcals) : undefined,
        proteinGrams: item.proteinGrams || item.protein ? Math.round(item.proteinGrams || item.protein) : undefined,
        armCm: item.armCm || item.arm ? parseFloat(item.armCm || item.arm) : undefined,
        chestCm: item.chestCm || item.chest ? parseFloat(item.chestCm || item.chest) : undefined,
        waistCm: item.waistCm || item.waist ? parseFloat(item.waistCm || item.waist) : undefined,
        thighCm: item.thighCm || item.thigh ? parseFloat(item.thighCm || item.thigh) : undefined,
        calfCm: item.calfCm || item.calf ? parseFloat(item.calfCm || item.calf) : undefined,
        benchPressKg: item.benchPressKg || item.bench ? parseFloat(item.benchPressKg || item.bench) : undefined,
        squatKg: item.squatKg || item.squat ? parseFloat(item.squatKg || item.squat) : undefined,
        deadliftKg: item.deadliftKg || item.deadlift ? parseFloat(item.deadliftKg || item.deadlift) : undefined,
        overheadPressKg: item.overheadPressKg || item.ohp ? parseFloat(item.overheadPressKg || item.ohp) : undefined,
        notes: item.notes || item.comment || undefined,
      };
    });

    return {
      success: entries.length > 0,
      entries,
      errors: [],
      columnMappingsDetected: { json: 'parsed successfully' },
    };
  } catch (err: any) {
    return { success: false, entries: [], errors: [`Invalid JSON: ${err.message}`], columnMappingsDetected: {} };
  }
}

export function exportToCSV(logs: ProgressLogEntry[]): string {
  const headers = [
    'Date',
    'Weight (kg)',
    'Body Fat (%)',
    'Lean Mass (kg)',
    'Calories (kcal)',
    'Protein (g)',
    'Arm (cm)',
    'Chest (cm)',
    'Waist (cm)',
    'Thigh (cm)',
    'Bench Press (kg)',
    'Squat (kg)',
    'Deadlift (kg)',
    'Notes'
  ];

  const rows = logs.map(log => [
    log.date,
    log.weightKg ?? '',
    log.bodyFatPercentage ?? '',
    log.leanBodyMassKg ?? '',
    log.caloriesConsumed ?? '',
    log.proteinGrams ?? '',
    log.armCm ?? '',
    log.chestCm ?? '',
    log.waistCm ?? '',
    log.thighCm ?? '',
    log.benchPressKg ?? '',
    log.squatKg ?? '',
    log.deadliftKg ?? '',
    `"${(log.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

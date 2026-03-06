import { getNucleusFrom2DExperiment } from './getNucleusFrom2DExperiment.ts';
import { getSpectrumType } from './getSpectrumType.ts';

export interface NMRMetadata {
  dimension: number;
  nucleus: string[];
  isFid: boolean;
  isFt: boolean;
  isComplex: boolean;
  title?: string;
  solvent?: string;
  pulse?: string;
  experiment?: string;
  temperature?: number;
  frequency?: number;
  type?: string;
  probe?: string;
  acquisitionMode?: number;
  expno?: number;
  date?: string;
  range?: unknown[];
}

/**
 * Extracts NMR metadata from parsed JCAMP info and meta records.
 * @param info - The info record from parsed JCAMP.
 * @param meta - The meta record from parsed JCAMP.
 * @returns The extracted NMR metadata.
 */
export function getMetaData(
  info: Record<string, unknown>,
  meta: Record<string, unknown>,
): NMRMetadata {
  const metadata = {
    dimension: 1,
    nucleus: [] as string[],
    isFid: false,
    isFt: false,
    isComplex: false,
  } as NMRMetadata & Record<string, unknown>;

  maybeAdd(metadata, 'title', info.TITLE);
  maybeAdd(metadata, 'solvent', info['.SOLVENTNAME']);
  maybeAdd(
    metadata,
    'pulse',
    info['.PULSESEQUENCE'] || info['.PULPROG'] || meta.PULPROG,
  );
  maybeAdd(
    metadata,
    'experiment',
    getSpectrumType(metadata as { pulse?: string }, info),
  );
  maybeAdd(
    metadata,
    'temperature',
    Number.parseFloat(asString(meta.TE || info['.TE'])),
  );
  maybeAdd(
    metadata,
    'frequency',
    Number.parseFloat(asString(info['.OBSERVEFREQUENCY'])),
  );
  maybeAdd(metadata, 'type', info.DATATYPE);
  maybeAdd(metadata, 'probe', meta.PROBHD);
  if (meta.FNTYPE !== undefined) {
    maybeAdd(
      metadata,
      'acquisitionMode',
      Number.parseInt(asString(meta.FNTYPE), 10),
    );
  }
  maybeAdd(metadata, 'expno', Number.parseInt(asString(meta.EXPNO), 10));
  if (metadata.type) {
    if (metadata.type.toUpperCase().includes('FID')) {
      metadata.isFid = true;
    } else if (metadata.type.toUpperCase().includes('SPECTRUM')) {
      metadata.isFt = true;
    }
  }

  const nucleus = info['.NUCLEUS'];
  const observeNucleus = info['.OBSERVENUCLEUS'];
  if (typeof nucleus === 'string') {
    metadata.nucleus = nucleus.split(',').map((nuc) => nuc.trim());
  } else if (typeof observeNucleus === 'string') {
    metadata.nucleus = [observeNucleus.replaceAll(/[^A-Za-z0-9]/g, '')];
  } else {
    metadata.nucleus = getNucleusFrom2DExperiment(metadata.experiment);
  }

  metadata.dimension = metadata.nucleus.length;

  const symbol = info.SYMBOL;
  if (typeof symbol === 'string') {
    const symbols = symbol.split(/[, ]+/);
    if (symbols.includes('R') && symbols.includes('I')) {
      metadata.isComplex = true;
    }
  }

  if (meta.DATE) {
    try {
      metadata.date = new Date(Number(meta.DATE) * 1000).toISOString();
    } catch {
      // eslint-disable-next-line no-console
      console.error('Could not parse date from meta.DATE');
    }
  }
  return metadata;
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function maybeAdd(
  object: Record<string, unknown>,
  name: string,
  value: unknown,
): void {
  if (value !== undefined) {
    if (typeof value === 'string') {
      if (value.startsWith('<') && value.endsWith('>')) {
        object[name] = value.slice(1, -1).trim();
      } else {
        object[name] = value.trim();
      }
    } else {
      object[name] = value;
    }
  }
}

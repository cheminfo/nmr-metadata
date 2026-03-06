import { convert } from 'jcampconverter';
import { xyAutoRangesPicking } from 'nmr-processing';

import type { NMRMetadata } from './getMetaData.ts';
import { getMetaData } from './getMetaData.ts';

export type { NMRMetadata } from './getMetaData.ts';

export interface FromJcampOptions {
  /** Whether to compute ranges for 1H FT spectra. */
  computeRanges?: boolean;
  /** Options for ranges computation. */
  ranges?: {
    integrationSum?: number;
    clean?: number;
    compile?: boolean;
    integralType?: string;
  };
  /** Options for impurities detection. */
  impurities?: {
    solvent?: string;
  };
  /** Options for peak picking. */
  peakPicking?: {
    thresholdFactor?: number;
    frequency?: number;
  };
}

const defaultRangesOptions = {
  integrationSum: 100,
  clean: 0.4,
  compile: true,
  integralType: 'sum',
};

const defaultPeaksOptions = {
  thresholdFactor: 0.85,
};

/**
 * Returns a metadata object from JCAMP data.
 * @param jcampData - The JCAMP string or ArrayBuffer.
 * @param options - Options for parsing and range computation.
 * @returns The extracted NMR metadata.
 */
export function fromJcamp(
  jcampData: string | ArrayBuffer | Uint8Array,
  options: FromJcampOptions = {},
): NMRMetadata {
  const { computeRanges = false } = options;

  const parsedJcamp = convert(jcampData, {
    keepRecordsRegExp: /.*/,
    canonicMetadataLabels: true,
    withoutXY: false,
  }).flatten[0];

  if (!parsedJcamp) {
    throw new Error('Failed to parse JCAMP data');
  }

  const metadata = getMetaData(
    parsedJcamp.info as Record<string, unknown>,
    parsedJcamp.meta as Record<string, unknown>,
  );

  if (
    computeRanges &&
    metadata.isFt &&
    metadata.dimension === 1 &&
    metadata.nucleus[0] === '1H'
  ) {
    const { ranges = {}, impurities = {}, peakPicking = {} } = options;

    const rangesOptions = { ...defaultRangesOptions, ...ranges };
    const peaksOptions = {
      ...defaultPeaksOptions,
      frequency: metadata.frequency || 400,
      ...peakPicking,
    };

    if (metadata.solvent) {
      impurities.solvent = metadata.solvent;
    }

    const spectrumData = parsedJcamp.spectra[0]?.data as
      | { x: number[]; y: number[] }
      | undefined;

    if (spectrumData) {
      const x = Float64Array.from(spectrumData.x);
      const y = Float64Array.from(spectrumData.y);

      // xyAutoRangesPicking requires monotone increasing x values
      const first = x[0];
      const last = x.at(-1);
      if (
        x.length > 1 &&
        first !== undefined &&
        last !== undefined &&
        first > last
      ) {
        x.reverse();
        y.reverse();
      }

      metadata.range = xyAutoRangesPicking(
        { x, y },
        {
          impurities,
          ranges: rangesOptions,
          peakPicking: peaksOptions,
        },
      );
    }
  }

  return metadata;
}

export { getSpectrumType } from './getSpectrumType.ts';

export { getMetaData as fromInfo } from './getMetaData.ts';

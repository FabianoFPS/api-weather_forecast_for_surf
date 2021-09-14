import { Beach, BeachPosition } from '@src/models/beach';

export class Rating {
  constructor(private beach: Beach) {}

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): number {
    if (wavePosition === windPosition) return 1;
    if (this.isWindOffShore(wavePosition, windPosition)) return 5;
    return 3;
  }

  private isWindOffShore(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return (
      (this.isWaveNorthAndWindSouth(wavePosition, windPosition) &&
        this.beach.position === BeachPosition.N) ||
      (this.isWaveSouthAndWindNorth(wavePosition, windPosition) &&
        this.beach.position === BeachPosition.S) ||
      (wavePosition === BeachPosition.E &&
        windPosition === BeachPosition.W &&
        this.beach.position === BeachPosition.E) ||
      (wavePosition === BeachPosition.W &&
        windPosition === BeachPosition.E &&
        this.beach.position === BeachPosition.W)
    );
  }

  private isWaveNorthAndWindSouth(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return wavePosition === BeachPosition.N && windPosition === BeachPosition.S;
  }

  private isWaveSouthAndWindNorth(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return wavePosition === BeachPosition.S && windPosition === BeachPosition.N;
  }
}

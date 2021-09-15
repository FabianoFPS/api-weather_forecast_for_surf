import { Beach, BeachPosition } from '@src/models/beach';

const waveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waisHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

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

  public getRatingForSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) return 2;
    if (period >= 10 && period < 14) return 4;
    if (period >= 14) return 5;

    return 1;
  }

  public getRatingForSwellSize(height: number): number {
    if (
      height >= waveHeights.ankleToKnee.min &&
      height < waveHeights.ankleToKnee.max
    )
      return 2;

    if (height >= waveHeights.waisHigh.min && height < waveHeights.waisHigh.max)
      return 3;

    if (height >= waveHeights.headHigh.min) return 5;

    return 1;
  }

  public getPositionFromLocation(coordinates: number): BeachPosition {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0))
      return BeachPosition.N;

    if (coordinates >= 50 && coordinates < 120) return BeachPosition.E;
    if (coordinates >= 120 && coordinates < 220) return BeachPosition.S;
    if (coordinates >= 220 && coordinates < 310) return BeachPosition.W;

    return BeachPosition.E;
  }

  private isWindOffShore(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return (
      this.isWaveNorthAndWindSouth(wavePosition, windPosition) ||
      this.isWaveSouthAndWindNorth(wavePosition, windPosition) ||
      this.isWaveEastAndWindWest(wavePosition, windPosition) ||
      this.isWaveWestAndWindEast(wavePosition, windPosition)
    );
  }

  private isWaveNorthAndWindSouth(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return (
      wavePosition === BeachPosition.N &&
      windPosition === BeachPosition.S &&
      this.beach.position === BeachPosition.N
    );
  }

  private isWaveSouthAndWindNorth(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return (
      wavePosition === BeachPosition.S &&
      windPosition === BeachPosition.N &&
      this.beach.position === BeachPosition.S
    );
  }

  private isWaveEastAndWindWest(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return (
      wavePosition === BeachPosition.E &&
      windPosition === BeachPosition.W &&
      this.beach.position === BeachPosition.E
    );
  }
  private isWaveWestAndWindEast(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): boolean {
    return (
      wavePosition === BeachPosition.W &&
      windPosition === BeachPosition.E &&
      this.beach.position === BeachPosition.W
    );
  }
}

import moment from 'moment';
// TODO: teste unitário
export class Time {
  public static getUnixTimeForFutureDays(days: number): number {
    return moment().add(days, 'days').unix();
  }
}

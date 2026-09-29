import { money, perMile, place } from './format';
import type { Fit, Load, Truck } from './types';

const up5 = (n: number) => Math.ceil(n * 20 - 1e-9) / 20; // round up to the nearest $0.05
const down5 = (n: number) => Math.floor(n * 20 + 1e-9) / 20;

/**
 * The per-mile rate worth asking for: at least 5% over the lane benchmark,
 * never below a rate that clears costs with a margin, and always a real
 * counter over what's posted.
 */
export function targetRpm(load: Load, fit: Fit): number {
  const costFloor = (fit.fuelCost + fit.driverPay + fit.fixedCost) / load.tripMiles + 0.35;
  const overPosted = fit.postedRpm != null ? fit.postedRpm + 0.25 : 0;
  return up5(Math.max(fit.marketRpm * 1.05, costFloor, overPosted));
}

/** Where the simulated Voice AI lands: a bit over halfway from posted to our ask. */
export function simulatedAgreement(load: Load, fit: Fit): number {
  const target = targetRpm(load, fit);
  const start = fit.postedRpm ?? fit.marketRpm;
  return Math.max(start, Math.min(target - 0.05, down5(start + (target - start) * 0.6)));
}

export interface EmailDraft {
  subject: string;
  body: string;
}

export function templateEmail(load: Load, fit: Fit, truck: Truck): EmailDraft {
  const target = targetRpm(load, fit);
  const lane = `${place(load.origin)} → ${place(load.destination)}`;
  const reach =
    fit.hos.status === 'ok' || fit.hos.status === 'tight'
      ? 'and can make your pickup window'
      : fit.hos.status === 'reset'
        ? 'and can make your window after a required break'
        : 'and is ready to roll';
  const deadhead = `the ${fit.deadheadMiles} empty miles to get there`;
  const ask =
    load.rate != null && fit.postedRpm! >= fit.marketRpm
      ? `We can take it at the posted ${money(load.rate)}. If there's any room, ${perMile(target)} (${money(target * load.tripMiles)}) would cover ${deadhead}.`
      : `${load.rate != null ? `The posted ${money(load.rate)} is ${perMile(fit.postedRpm!)}, and t` : 'T'}his lane is running about ${perMile(fit.marketRpm)}. Can you do ${perMile(target)} (${money(target * load.tripMiles)}) all-in? We can book on confirmation.`;
  return {
    subject: `${lane} · ${truck.equipment} available`,
    body: [
      `Hi ${load.broker.name} team,`,
      '',
      `Interested in your ${lane} load. Truck ${truck.unit} (53' ${truck.equipment.toLowerCase()}) is ${fit.deadheadMiles} mi out ${reach}.`,
      '',
      ask,
      '',
      'Thanks,',
      'Dispatch',
    ].join('\n'),
  };
}

/** Plain-text context for the optional Claude draft. */
export function emailPrompt(load: Load, fit: Fit, truck: Truck): string {
  const t = templateEmail(load, fit, truck);
  return [
    'Write a short, friendly, professional rate-negotiation email from a trucking dispatcher to a freight broker.',
    'Keep every number exactly as given. Plain text, no markdown, under 110 words. Start with the greeting, no subject line.',
    '',
    `Lane: ${place(load.origin)} to ${place(load.destination)}, ${load.tripMiles} loaded miles, ${load.equipment}.`,
    `Broker: ${load.broker.name}.`,
    `Posted rate: ${load.rate != null ? `${money(load.rate)} (${perMile(fit.postedRpm!)})` : 'none posted'}.`,
    `Lane market rate: ${perMile(fit.marketRpm)}.`,
    `Our ask: ${perMile(targetRpm(load, fit))}.`,
    `Truck ${truck.unit} is ${fit.deadheadMiles} miles from pickup.`,
    '',
    'For reference, a plain version:',
    t.body,
  ].join('\n');
}

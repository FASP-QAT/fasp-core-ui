import getLabelText from '../../src/CommonComponent/getLabelText';

describe('getLabelText function', () => {
  it('should return the English label when lang is "en"', () => {
    const label = { label_en: 'Hello', label_fr: 'Bonjour' };
    const lang = 'en';
    expect(getLabelText(label, lang)).toBe('Hello');
  });

  it('should return the French label when lang is "fr" and label_fr is not empty', () => {
    const label = { label_en: 'Hello', label_fr: 'Bonjour' };
    const lang = 'fr';
    expect(getLabelText(label, lang)).toBe('Bonjour');
  });

  it('should return the English label when lang is "fr" and label_fr is empty', () => {
    const label = { label_en: 'Hello', label_fr: '' };
    const lang = 'fr';
    expect(getLabelText(label, lang)).toBe('Hello');
  });

  it('should return the Spanish label when lang is "sp" and label_sp is not empty', () => {
    const label = { label_en: 'Hello', label_sp: 'Hola' };
    const lang = 'sp';
    expect(getLabelText(label, lang)).toBe('Hola');
  });

  it('should return the English label when lang is "sp" and label_sp is empty', () => {
    const label = { label_en: 'Hello', label_sp: '' };
    const lang = 'sp';
    expect(getLabelText(label, lang)).toBe('Hello');
  });

  it('should return the Portuguese label when lang is "pr" and label_pr is not empty', () => {
    const label = { label_en: 'Hello', label_pr: 'Olá' };
    const lang = 'pr';
    expect(getLabelText(label, lang)).toBe('Olá');
  });

  it('should return the English label when lang is "pr" and label_pr is empty', () => {
    const label = { label_en: 'Hello', label_pr: '' };
    const lang = 'pr';
    expect(getLabelText(label, lang)).toBe('Hello');
  });

  it('should return the English label when lang is not recognized', () => {
    const label = { label_en: 'Hello' };
    const lang = 'unknown';
    expect(getLabelText(label, lang)).toBe('Hello');
  });
});
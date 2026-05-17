/**
 * Declaraciones de tipos para activos estáticos (Ambient Types).
 *
 * Este archivo es crucial para que TypeScript no marque errores al importar
 * archivos que no son .ts o .tsx (como CSS, imágenes o SVGs).
 * Sin esto, 'import "./styles.css"' fallaría en el compilador.
 */

// Permite importar archivos CSS como módulos
declare module '*.css';
declare module '*.scss';

// Permite importar imágenes y otros archivos de medios
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

// Exportación vacía para que TS lo trate como un módulo
export {};

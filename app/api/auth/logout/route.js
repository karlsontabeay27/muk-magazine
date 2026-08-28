import { NextResponse } from 'next/server';
import { COOKIE } from '@/lib/auth';

export async function POST() {
  const reponse = NextResponse.json({ ok: true });
  // maxAge 0 : le navigateur efface le cookie immédiatement.
  reponse.cookies.set(COOKIE.nom, '', { path: '/', maxAge: 0 });
  return reponse;
}

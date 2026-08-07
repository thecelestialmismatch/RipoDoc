import React from 'react';

export default function SecurityPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Security Model</h1>
        <p className="mt-2 text-sm text-gray-600">
          This page will detail RipoDoc's comprehensive security model, including recipient binding, expiry, revocation, and audit logging.
        </p>
      </div>
    </div>
  );
}

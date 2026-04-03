"use client";
import React, { useEffect, useState, use } from "react";
import QRCode from "react-qr-code";

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const [verifyURL, setVerifyURL] = useState("");
  const resolvedParams = use(params);
  const idToShare = resolvedParams.id || '';

  useEffect(() => {
    if (idToShare) {
      setVerifyURL(`${window.location.origin}/verify/${idToShare}`);
    }
  }, [idToShare]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Share Credential</h1>
      <p className="text-gray-400">Verifiers scan this QR to confirm authenticity in seconds</p>
      <div className="bg-white p-6 rounded-2xl">
        <QRCode value={verifyURL || "loading..."} size={250} />
      </div>
      <p className="text-gray-600 font-mono text-xs break-all max-w-sm text-center">{verifyURL}</p>
    </div>
  );
}

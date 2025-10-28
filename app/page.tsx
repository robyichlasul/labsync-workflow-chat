"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, Users, Calendar, Shield, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
            Labsync Chat
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Platform komunikasi laboratorium modern dengan AI assistant, real-time chat, dan manajemen workflow
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/sign-up">Mulai Gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/sign-in">Masuk</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <main className="container mx-auto px-4 pb-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Utama</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Solusi lengkap untuk komunikasi dan manajemen laboratorium Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Real-time Chat */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Real-time Chat</CardTitle>
              <CardDescription>
                Komunikasi antar user dan divisi dengan sistem chat real-time yang cepat dan aman
              </CardDescription>
            </CardHeader>
          </Card>

          {/* AI Assistant */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Chatbot AI yang memberikan informasi jadwal, status MCU, dan update laboratorium
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Status Updates */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Status Updates</CardTitle>
              <CardDescription>
                Bagikan status update dengan interaksi seperti sosial media, bisa privat atau publik
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Role Management */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Sistem peran (Owner, Manager, Staff) dengan kontrol akses sesuai jobdesk
              </CardDescription>
            </CardHeader>
          </Card>

          {/* File Sharing */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>File Sharing</CardTitle>
              <CardDescription>
                Kirim dokumen PDF, Excel, dan gambar dengan kompresi otomatis untuk hemat storage
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Schedule Management */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>
                Kelola jadwal pemeriksaan, update reagent, dan informasi laboratorium lainnya
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl md:text-3xl">Siap meningkatkan komunikasi laboratorium Anda?</CardTitle>
              <CardDescription className="text-lg">
                Bergabunglah dengan platform komunikasi laboratorium modern
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/sign-up">Mulai Sekarang</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

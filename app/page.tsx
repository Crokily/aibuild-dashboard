import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Upload, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Build Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze procurement, sales, and inventory trends with powerful data visualization tools
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Upload Data</CardTitle>
              <CardDescription>
                Import your Excel files with product, procurement, and sales data
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full">
                <Link href="/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Excel
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>View Dashboard</CardTitle>
              <CardDescription>
                Visualize trends with interactive charts and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Open Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Account Access</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full" size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Key Features</CardTitle>
            <CardDescription>
              Everything you need to analyze your business data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Data Import & Processing</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Excel file upload support (.xlsx, .xls)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Automatic data parsing and validation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Multi-day data processing
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Visualization & Analytics</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Interactive line charts with multiple data series
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Product comparison and selection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Real-time trend analysis
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Share2,
  LayoutDashboard,
  AlertCircle,
  FileQuestion,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import Portfolio from './Portfolio';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Toast from '../components/Toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { publicService } from '../services/api';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPublicPortfolio() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);
      setErrorMessage(null);

      try {
        const response = await publicService.getPublicPortfolio(slug);
        if (!isMounted) return;

        if (response.data.success && response.data.portfolio) {
          setPortfolioData(response.data.portfolio);
          const studentName = response.data.portfolio.profile?.name || 'Student';
          document.title = `${studentName} | Student Portfolio`;
        } else {
          setNotFound(true);
          document.title = 'Portfolio Not Found | Folio';
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setNotFound(true);
          document.title = 'Portfolio Not Found | Folio';
        } else {
          setErrorMessage(
            err.response?.data?.message ||
              'Unable to connect to the portfolio repository. Please check your network connection.'
          );
          document.title = 'Portfolio Unavailable | Folio';
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPublicPortfolio();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    const currentUrl = window.location.href;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setToastMessage('Public portfolio link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      setToastMessage(`Public URL: ${currentUrl}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      {/* Standalone Public Header Navbar */}
      <header className="h-16 px-4 sm:px-8 lg:px-12 border-b border-white/[0.08] bg-[#0C0E17]/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white group-hover:text-brand-300 transition-colors">
              Folio
            </span>
            <span className="text-[10px] block text-slate-400 font-medium tracking-wide uppercase -mt-0.5">
              Verified Public Repository
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={copied ? Check : Share2}
            onClick={handleShare}
            className="hidden sm:inline-flex"
          >
            {copied ? 'Copied' : 'Share'}
          </Button>

          <Link to="/dashboard">
            <Button variant="secondary" size="sm" leftIcon={LayoutDashboard}>
              Open App Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1 px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        {/* Loading state */}
        {loading && (
          <div className="space-y-12 max-w-6xl mx-auto py-8">
            <div className="p-8 rounded-3xl bg-[#11131F] border border-white/[0.06] animate-pulse flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-40 rounded-3xl bg-white/[0.05]" />
              <div className="flex-1 space-y-4 w-full">
                <div className="h-6 w-36 bg-white/[0.08] rounded-full" />
                <div className="h-10 w-3/4 bg-white/[0.08] rounded-lg" />
                <div className="h-4 w-1/2 bg-white/[0.04] rounded" />
                <div className="h-16 w-full bg-white/[0.03] rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingSkeleton type="card" count={3} />
            </div>
          </div>
        )}

        {/* 404 Not Found state */}
        {!loading && notFound && (
          <div className="max-w-xl mx-auto py-16 text-center space-y-6">
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 inline-flex shadow-glow-sm">
              <FileQuestion className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <Badge variant="warning" size="md">
                404 Not Found
              </Badge>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Student Portfolio Not Found
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                No active student repository matches the public address:{' '}
                <code className="text-brand-300 bg-black/50 px-2 py-0.5 rounded font-mono text-xs">
                  /portfolio/{slug}
                </code>
              </p>
            </div>

            <Card className="text-left space-y-3 bg-[#111320] border-white/[0.06]">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Suggestions:
              </h4>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Check for typos in the student's name or register number.</li>
                <li>Request an updated portfolio link directly from the student.</li>
                <li>Make sure the student has registered their portfolio account.</li>
              </ul>
            </Card>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/')}
                leftIcon={ArrowLeft}
              >
                Back to Home
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Generic Error state */}
        {!loading && !notFound && errorMessage && (
          <div className="max-w-xl mx-auto py-16 text-center space-y-5">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 inline-flex">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Repository Unavailable</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">{errorMessage}</p>
            </div>
            <Button
              variant="secondary"
              size="md"
              leftIcon={RefreshCw}
              onClick={() => window.location.reload()}
            >
              Reload Portfolio
            </Button>
          </div>
        )}

        {/* Verified Public Portfolio presentation */}
        {!loading && !notFound && portfolioData && (
          <Portfolio isPublic={true} publicData={portfolioData} slug={slug} />
        )}
      </main>

      <Toast
        isOpen={!!toastMessage}
        onClose={() => setToastMessage(null)}
        title="Share Portfolio"
        message={toastMessage}
        type="success"
      />
    </div>
  );
}

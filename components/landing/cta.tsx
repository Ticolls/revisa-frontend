import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 sm:p-12 border border-primary/10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Pronto para começar?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Junte-se à comunidade de estudantes de Ciência da Computação da UFBA e comece a compartilhar conhecimento
            hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto group">
              <Link href="/cadastro">
                Criar conta gratuita
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              <Link href="/login">Fazer login</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

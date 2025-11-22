import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden overflow-x-hidden py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
            Compartilhe conhecimento com <span className="text-primary">seus colegas</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
            A plataforma colaborativa para estudantes de Ciência da Computação da UFBA. Faça upload e download de
            materiais acadêmicos organizados por disciplina.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto group">
              <Link href="/cadastro">
                Começar agora
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Materiais disponíveis</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-sm text-muted-foreground">Disciplinas cobertas</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Estudantes ativos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

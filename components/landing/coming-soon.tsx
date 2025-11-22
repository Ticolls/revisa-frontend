import { HeartHandshake, Vote, UserCheck, BookCopy, GraduationCap } from "lucide-react"

export function ComingSoon() {
  return (
    <section id="coming-soon" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">Em breve</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            O REVISA está evoluindo e em breve terá novas funcionalidades para tornar a plataforma ainda mais democrática
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {/* Destaque principal */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary mb-6 ring-8 ring-primary/5">
              <HeartHandshake className="size-8" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Gerenciamento Comunitário</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Em breve, a comunidade terá o poder de gerenciar a plataforma através de um sistema 
              democrático de solicitações e votações.
            </p>
          </div>

          {/* Grid de features */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
                <Vote className="size-6" />
              </div>
              <h4 className="text-lg font-semibold">Sistema de Votação</h4>
              <p className="text-sm text-muted-foreground">
                Membros ativos poderão votar em decisões importantes sobre a organização
                e o conteúdo da plataforma.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
                <BookCopy className="size-6" />
              </div>
              <h4 className="text-lg font-semibold">Gestão de Disciplinas</h4>
              <p className="text-sm text-muted-foreground">
                A comunidade poderá sugerir novas disciplinas, modificar existentes
                ou remover as que não são mais relevantes.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="size-6" />
              </div>
              <h4 className="text-lg font-semibold">Cadastro de Professores</h4>
              <p className="text-sm text-muted-foreground">
                Adicione e atualize informações sobre professores para melhor
                organização dos materiais de estudo.
              </p>
            </div>
          </div>

          {/* Decoração de fundo */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-primary/5 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/5 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
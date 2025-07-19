import React from 'react';
import { ArrowLeft, Scroll } from 'lucide-react';

interface RulesScreenProps {
  onBack: () => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#000c1a] to-[#001830] flex items-center justify-center p-4 z-50 overflow-hidden">
      {/* Magical Runes Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-24 h-24 border border-[#00ffe1]/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `float ${5 + Math.random() * 5}s infinite ease-in-out ${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-4xl w-full h-[90vh] overflow-hidden">
        {/* Top Decorative Line */}
        <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
        
        {/* Main Panel */}
        <div className="relative border border-[#00ffe1]/30 rounded-lg p-8 bg-[#000c1a]/90 backdrop-blur-sm h-full flex flex-col">
          {/* Glowing Effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#00ffe1]/5 to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative flex-1 overflow-y-auto space-y-8 pr-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#00ffe1] hover:text-[#00ff88] transition-colors"
              >
                <ArrowLeft size={24} />
                <span>Voltar</span>
              </button>

              <div className="flex items-center gap-2">
                <Scroll size={24} className="text-[#00ffe1]" />
                <h1 className="text-4xl font-bold text-[#00ffe1] tracking-wider drop-shadow-[0_0_10px_#00ffe1]">
                  Livro de Regras
                </h1>
              </div>

              <div className="w-[88px]" /> {/* Spacer to center the title */}
            </div>

            <div className="prose prose-invert max-w-none">
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  1. Atributos Base
                </h2>
                <p className="text-[#00ffe1]/80">
                  Todos os personagens possuem os seguintes atributos:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-2">STR (Força)</h3>
                    <p className="text-[#00ffe1]/70">Dano físico, carga</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-2">VIT (Constituição)</h3>
                    <p className="text-[#00ffe1]/70">HP, resistência física</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-2">AGI (Agilidade)</h3>
                    <p className="text-[#00ffe1]/70">Esquiva, velocidade, chance de crítico</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-2">INT (Inteligência)</h3>
                    <p className="text-[#00ffe1]/70">Mana, dano mágico</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-2">SENSE (Percepção)</h3>
                    <p className="text-[#00ffe1]/70">Precisão, detecção, resistência a furtividade</p>
                  </div>
                </div>
              </section>

              <section className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  2. Fórmulas Padrão
                </h2>
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">2.1. Vida (HP)</h3>
                    <div className="bg-[#002040] p-4 rounded-lg font-mono text-[#00ff88]">
                      HP = 100 + (VIT × 12)
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">2.2. Mana (MP)</h3>
                    <div className="bg-[#002040] p-4 rounded-lg font-mono text-[#00ff88]">
                      MP = 50 + (INT × 15)
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">2.3. Fadiga (FAT)</h3>
                    <div className="bg-[#002040] p-4 rounded-lg font-mono text-[#00ff88]">
                      Fadiga Máxima = 100 + (VIT × 2)
                    </div>
                    <p className="mt-4 text-[#00ffe1]/70 italic">
                      Fadiga aumenta com ações físicas/mágicas. A 100+ o personagem começa a receber penalidades.
                    </p>
                  </div>

                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">2.4. Dano Físico (Ataque Corpo a Corpo)</h3>
                    <div className="bg-[#002040] p-4 rounded-lg font-mono text-[#00ff88]">
                      Dano = (STR × 2) + (arma)
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">2.5. Dano Mágico (Habilidade Mágica)</h3>
                    <div className="bg-[#002040] p-4 rounded-lg font-mono text-[#00ff88]">
                      Dano = (INT × 2.5) + (nível da magia × 3)
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  3. Sistema de Rolagens
                </h2>
                <p className="text-[#00ffe1]/80">
                  Usa-se 2d10 (dois dados de 10 lados) como base para ações.
                </p>

                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">3.1. Teste de Atributo</h3>
                    <div className="bg-[#002040] p-4 rounded-lg font-mono text-[#00ff88]">
                      2d10 + atributo relevante ≥ dificuldade
                    </div>
                    <p className="mt-4 text-red-500">
                      Falha crítica: se os dois dados rolam 1 (1,1 natural) a ação será uma falha crítica.
                    </p>
                    
                    <div className="mt-6">
                      <h4 className="text-[#00ffe1] font-bold mb-2">Dificuldades:</h4>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#00ffe1]/30">
                            <th className="text-left py-2 text-[#00ffe1]">Dificuldade</th>
                            <th className="text-right py-2 text-[#00ffe1]">Valor Alvo</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#00ffe1]/10">
                            <td className="py-2 text-[#00ffe1]/70">Fácil</td>
                            <td className="text-right text-[#00ff88]">12</td>
                          </tr>
                          <tr className="border-b border-[#00ffe1]/10">
                            <td className="py-2 text-[#00ffe1]/70">Moderada</td>
                            <td className="text-right text-[#00ff88]">20</td>
                          </tr>
                          <tr className="border-b border-[#00ffe1]/10">
                            <td className="py-2 text-[#00ffe1]/70">Difícil</td>
                            <td className="text-right text-[#00ff88]">35</td>
                          </tr>
                          <tr className="border-b border-[#00ffe1]/10">
                            <td className="py-2 text-[#00ffe1]/70">Muito Difícil</td>
                            <td className="text-right text-[#00ff88]">50</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-[#00ffe1]/70">Quase impossível</td>
                            <td className="text-right text-[#00ff88]">65+</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">3.2. Testes de Combate</h3>
                    <div className="bg-[#002040] p-4 rounded-lg font-mono text-[#00ff88]">
                      Ataque vs Defesa: 2d10 + ataque vs 10 + AGI ou valor de armadura
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-yellow-400">
                        Crítico: se os dois dados rolam 10 (20 natural), o dano será crítico (x2 dano).
                      </p>
                      <p className="text-red-500">
                        Falha crítica: se os dois dados rolam 1 (1,1 natural) o ataque sofrerá uma falha crítica.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  4. Progressão de Nível e Pontos
                </h2>

                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">4.1. Distribuição Inicial (Nível 1)</h3>
                    <ul className="list-disc list-inside space-y-2 text-[#00ffe1]/80">
                      <li>Atributos Iniciais: 50 pontos livres</li>
                      <li>Valor mínimo por atributo: 1</li>
                      <li>Valor máximo inicial por atributo: 50</li>
                    </ul>
                  </div>

                  <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                    <h3 className="text-[#00ffe1] font-bold mb-4">4.2. Pontos por Nível</h3>
                    <ul className="list-disc list-inside space-y-2 text-[#00ffe1]/80">
                      <li>+3 pontos de atributo por nível</li>
                      <li>A cada 10 níveis, o jogador recebe +6 pontos de atributo (bônus duplicado)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  5. Títulos
                </h2>
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30">
                  <p className="text-[#00ffe1]/80">
                    Todos os personagens possuem títulos, podendo trocá-los conforme desejarem, os títulos
                    podem conceder atributos positivos ou negativos.
                  </p>
                  <p className="mt-4 text-[#00ffe1]/80 font-bold">
                    Somente um título pode ser utilizado por vez.
                  </p>
                </div>
              </section>

              <section className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  6. Armas
                </h2>
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30 space-y-4">
                  <p className="text-[#00ffe1]/80">
                    As armas concedem bônus padrão no Ataque do personagem, elas também podem
                    conceder bônus em atributos, defesa, ou mesmo habilidades únicas.
                  </p>
                  <p className="text-[#00ffe1]/80">
                    As armas tem uma durabilidade, podendo ser reparadas em um ferreiro.
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="text-[#00ffe1] font-bold mb-2">Ranks de Armas:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#002040] p-4 rounded-lg border border-gray-400/20">
                        <span className="text-gray-400">1 - Mundana</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-green-400/20">
                        <span className="text-green-400">2 - Incomum</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-blue-400/20">
                        <span className="text-blue-400">3 - Rara</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-purple-400/20">
                        <span className="text-purple-400">4 - Épica</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-yellow-400/20">
                        <span className="text-yellow-400">5 - Lendária</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-red-400/20">
                        <span className="text-red-400">6 - Artefato</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="bg-[#002040] p-4 rounded-lg">
                      <p className="text-[#00ff88] font-mono">
                        Cada arma concede 10 * o seu nível de raridade padrão ao Ataque.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-12 space-y-6">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  7. Armaduras
                </h2>
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30 space-y-4">
                  <p className="text-[#00ffe1]/80">
                    As armaduras concedem bônus padrão na Defesa do personagem, elas também podem
                    conceder bônus em atributos, HP/Esquiva, ou mesmo habilidades únicas.
                  </p>
                  <p className="text-[#00ffe1]/80">
                    As armaduras tem uma durabilidade, podendo ser reparadas em um ferreiro.
                  </p>
                  <p className="text-[#00ffe1]/80">
                    Três tipos de armadura podem ser equipados, em alguns casos, armaduras formam sets
                    que garantem bônus adicionais.
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="text-[#00ffe1] font-bold mb-2">Ranks de Armaduras:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#002040] p-4 rounded-lg border border-gray-400/20">
                        <span className="text-gray-400">1 - Mundana</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-green-400/20">
                        <span className="text-green-400">2 - Incomum</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-blue-400/20">
                        <span className="text-blue-400">3 - Rara</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-purple-400/20">
                        <span className="text-purple-400">4 - Épica</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-yellow-400/20">
                        <span className="text-yellow-400">5 - Lendária</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-red-400/20">
                        <span className="text-red-400">6 - Artefato</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="bg-[#002040] p-4 rounded-lg">
                      <p className="text-[#00ff88] font-mono">
                        Cada armadura concede 10 * o seu nível de raridade padrão a Defesa.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-12 space-y-6 mb-12">
                <h2 className="text-2xl font-bold text-[#00ffe1] border-b border-[#00ffe1]/30 pb-2">
                  8. Acessórios
                </h2>
                <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#00ffe1]/30 space-y-4">
                  <p className="text-[#00ffe1]/80">
                    Os acessórios concedem bônus em qualquer característica do personagem, eles também
                    podem conceder bônus em habilidades, ou mesmo habilidades únicas.
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="text-[#00ffe1] font-bold mb-2">Ranks de Acessórios:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#002040] p-4 rounded-lg border border-gray-400/20">
                        <span className="text-gray-400">1 - Mundano</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-green-400/20">
                        <span className="text-green-400">2 - Incomum</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-blue-400/20">
                        <span className="text-blue-400">3 - Raro</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-purple-400/20">
                        <span className="text-purple-400">4 - Épico</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-yellow-400/20">
                        <span className="text-yellow-400">5 - Lendário</span>
                      </div>
                      <div className="bg-[#002040] p-4 rounded-lg border border-red-400/20">
                        <span className="text-red-400">6 - Artefato</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#00ffe1]/80 mt-6">
                    Três tipos de acessórios podem ser equipados, em alguns casos, acessórios formam sets
                    que garantem bônus adicionais.
                  </p>

                  <div className="mt-6">
                    <div className="bg-[#002040] p-4 rounded-lg">
                      <p className="text-[#00ff88] font-mono">
                        Cada acessório concede 10 * o seu nível de raridade padrão o bônus designado.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ffe1] to-transparent" />
      </div>
    </div>
  );
};
import prisma from "../config/prisma.js"

// =====================================================
// 1. CRÉATION D'UNE NAISSANCE
// =====================================================
export const createBirth = async (req, res) => {
    try {
        const {
            childFirstname,
            childLastname,
            birthDate,
            birthPlace,
            sex,
            centerId,
            fatherName,
            motherName,
            fatherJob,
            motherJob,
            agentName
        } = req.body;

        // ==========================================
        // 1. VALIDATION DES CHAMPS OBLIGATOIRES
        // ==========================================

        if (
            !childFirstname ||
            !childLastname ||
            !birthDate ||
            !birthPlace ||
            !sex ||
            !centerId ||
            !fatherName ||
            !motherName ||
            !agentName
        ) {
            return res.status(400).json({
                success: false,
                message: "Les champs obligatoires sont requis"
            });
        }

        // ==========================================
        // 2. VALIDATION DU SEXE
        // ==========================================

        if (!["MALE", "FEMALE"].includes(sex)) {
            return res.status(400).json({
                success: false,
                message: "Le sexe doit être MALE ou FEMALE"
            });
        }

        // ==========================================
        // 3. VALIDATION DE LA DATE
        // ==========================================

        const parsedBirthDate = new Date(birthDate);

        if (isNaN(parsedBirthDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "La date de naissance est invalide"
            });
        }

        // ==========================================
        // 4. ANNÉE COURANTE
        // ==========================================

        const year = new Date().getFullYear();

        // ==========================================
        // 5. RÉCUPÉRER LE DERNIER NUMÉRO D'ACTE
        // ==========================================

        const lastBirth = await prisma.birth.findFirst({
            where: {
                actNumber: {
                    startsWith: `YAO05-${year}-`
                }
            },
            orderBy: {
                actNumber: "desc"
            }
        });

        let nextNumber = 1;

        if (lastBirth) {
            const parts = lastBirth.actNumber.split("-");

            const lastNumber = parseInt(parts[2], 10);

            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        // ==========================================
        // 6. GÉNÉRATION DU NUMÉRO D'ACTE
        // ==========================================

        const actNumber = `YAO05-${year}-${String(nextNumber).padStart(6, "0")}`;

        // ==========================================
        // 7. UTILISATEUR CONNECTÉ
        // ==========================================

        const userId = req.user?.id || "SYSTEM";

        // ==========================================
        // 8. CRÉATION DE L'ACTE
        // ==========================================

        const birth = await prisma.birth.create({
            data: {
                actNumber,

                childFirstname: childFirstname.trim(),
                childLastname: childLastname.trim(),

                birthDate: parsedBirthDate,

                birthPlace: birthPlace.trim(),

                sex,

                status: "PENDING",

                centerId,

                agentName: agentName.trim(),

                createdBy: userId,

                // ======================================
                // PARENTS
                // ======================================

                parents: {
                    create: {
                        fatherName: fatherName.trim(),
                        motherName: motherName.trim(),
                        fatherJob: fatherJob?.trim() || null,
                        motherJob: motherJob?.trim() || null
                    }
                },

                // ======================================
                // HISTORIQUE
                // ======================================

                histories: {
                    create: {
                        action: "CREATE",
                        userId
                    }
                }
            },

            include: {
                parents: true,
                histories: true
            }
        });

        // ==========================================
        // 9. RÉPONSE
        // ==========================================

        return res.status(201).json({
            success: true,
            message: "Naissance enregistrée avec succès",
            data: {
                id: birth.id,
                actNumber: birth.actNumber,
                childFirstname: birth.childFirstname,
                childLastname: birth.childLastname,
                status: birth.status
            }
        });

    } catch (error) {

        console.error("Erreur création naissance :", error);

        // ==========================================
        // 10. GESTION DU DOUBLON
        // ==========================================

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Le numéro d'acte existe déjà. Veuillez réessayer."
            });
        }

        // ==========================================
        // 11. ERREUR SERVEUR
        // ==========================================

        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur"
        });
    }
};

// =====================================================
// 2. AFFICHER TOUTES LES NAISSANCES
// =====================================================
export const allBirth = async (req, res) => {
    try {
        const allBirth = await prisma.birth.findMany();
        res.status(200).json({
            success: true,
            allBirth
        });
    } catch (error) {
        console.error(error?.stack || error);
        res.status(500).json({
            success: false,
            message: "erreur du serveur 🕵️‍♂️"
        });
    }
}

// =====================================================
// 3. AFFICHER UNE NAISSANCE PAR ID
// =====================================================
export const getBirthById = async (req, res) => {
    try {
        const { id } = req.params;

        const birth = await prisma.birth.findUnique({
            where: { id },
            include: {
                parents: true,
                attachments: true,
                histories: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!birth) {
            return res.status(404).json({
                success: false,
                message: "Naissance introuvable",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Naissance récupérée avec succès",
            data: birth,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur",
        });
    }
};

// =====================================================
// 4. SUPPRIMER UNE NAISSANCE
// =====================================================
export const deleteBirth = async (req, res) => {
    try {
        const { id } = req.params;

        const birth = await prisma.birth.findUnique({
            where: { id },
        });

        if (!birth) {
            return res.status(404).json({
                success: false,
                message: "Naissance introuvable",
            });
        }

        if (birth.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Seules les naissances non validées peuvent être supprimées",
            });
        }

        await prisma.birth.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: "Naissance non validée supprimée avec succès",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur",
        });
    }
};

// =====================================================
// 5. DASHBOARD STATISTIQUES
// =====================================================
export const getBirthDashboard = async (req, res) => {
    try {
        const totalBirths = await prisma.birth.count();
        const approvedBirths = await prisma.birth.count({
            where: { status: "APPROVED" },
        });
        const pendingBirths = await prisma.birth.count({
            where: { status: "PENDING" },
        });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(todayStart.getDate() + 1);

        const birthsToday = await prisma.birth.count({
            where: {
                createdAt: {
                    gte: todayStart,
                    lt: tomorrowStart,
                },
            },
        });

        const latestBirths = await prisma.birth.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                parents: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Statistiques du dashboard des naissances récupérées avec succès",
            data: {
                totalBirths,
                approvedBirths,
                pendingBirths,
                birthsToday,
                latestBirths,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erreur interne du serveur",
        });
    }
};

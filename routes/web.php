<?php

use App\Exports\ResidentsExport;
use App\Http\Controllers\ActivityLogsController;
use App\Http\Controllers\AllergyController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\BarangayInfrastructureController;
use App\Http\Controllers\BarangayFacilityController;
use App\Http\Controllers\BarangayInstitutionController;
use App\Http\Controllers\BarangayManagementController;
use App\Http\Controllers\BarangayOfficialController;
use App\Http\Controllers\BarangayProfileController;
use App\Http\Controllers\BarangayProjectController;
use App\Http\Controllers\BarangayRoadController;
use App\Http\Controllers\BlotterController;
use App\Http\Controllers\CaseParticipantController;
use App\Http\Controllers\CDRRMOAdminController;
use App\Http\Controllers\CDRRMOSuperAdminController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ChildHealthMonitoringController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\CRA\PDFController;
use App\Http\Controllers\CRAController;
use App\Http\Controllers\CRADataController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeathController;
use App\Http\Controllers\DisabilityController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentGenerationController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\FamilyController;
use App\Http\Controllers\FamilyRelationController;
use App\Http\Controllers\FamilyTreeController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\IBIMSController;
use App\Http\Controllers\InstitutionMemberController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LandController;
use App\Http\Controllers\LivelihoodController;
use App\Http\Controllers\MedicalInformationController;
use App\Http\Controllers\OccupationController;
use App\Http\Controllers\PregnancyRecordController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportGenerationController;
use App\Http\Controllers\ResidentAccountController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\ResidentMedicalConditionController;
use App\Http\Controllers\ResidentMedicationController;
use App\Http\Controllers\ResidentVaccinationController;
use App\Http\Controllers\SeniorCitizenController;
use App\Http\Controllers\StreetController;
use App\Http\Controllers\SummonController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\SuperAdminDataController;
use App\Http\Controllers\UnauthenticatedIssuanceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\WaterController;
use App\Models\BarangayInfrastructure;
use App\Models\BarangayInstitution;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;


Route::get('/', [IBIMSController::class, 'welcome'])->name('welcome'); // Welcome page accessible to both admin and resident
Route::get('/test-email', [EmailController::class, 'sendPHPMailerEmail']);
Route::get('/getCRA', [CRADataController::class, 'getCRA'])->name('getcra');
Route::get('/getCRAList', [CRADataController::class, 'getCRAList'])->name('getcralist');
Route::get('/craProgress', [CRAController::class, 'craProgress'])->name('craProgress');
Route::patch('/user/{user}/toggle-account', [UserController::class, 'toggleAccount'])->name('user.toggle');
Route::patch('/barangayofficial/{official}/toggle-status', [BarangayOfficialController::class, 'toggleStatus'])->name('official.toggle');
    Route::get('cdrrmo_admin/dashboard', [CDRRMOAdminController::class, 'index'])
        ->name('cdrrmo_admin.dashboard');

Route::get('/test-mail-env', function () {
    return [
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
    ];
});

// Admin-only routes
Route::middleware(['auth', 'role:barangay_officer|cdrrmo_admin|super_admin|admin'])->group(function () {
    // cra
    Route::get('cra/index', [CRAController::class, 'index'])->name('cra.index');
    Route::get('cra/create', [CRAController::class, 'create'])->name('cra.create');
    Route::get('cra/dashboard', [CRAController::class, 'dashboard'])->name('cra.dashboard');
    Route::get('cra/datacollection', [CRAController::class, 'brgyDataCollection'])->name('cra.datacollection');
    Route::post('cra/store', [CRAController::class, 'store'])->name('cra.store');

    Route::get('barangay_management/barangaydetails', [BarangayManagementController::class, 'barangayDetails'])->name('barangay_profile.details');

    // CRA PDF route
    Route::get('/cra/pdf/{id}', [PDFController::class, 'download'])
        ->name('cra.pdf');

    Route::post('/check-email-unique', function (Request $request) {
        $request->validate([
            'email' => 'required|email'
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json(['unique' => !$exists]);
    });

});

Route::middleware(['auth', 'role:barangay_officer'])->group(function () {
    Route::get('/barangay_officer', function () {
        return redirect()->route('barangay_officer.dashboard');
    });
    Route::get('/barangay_officer/dashboard', [DashboardController::class, 'dashboard'])
        ->name('barangay_officer.dashboard');
});

Route::middleware(['auth', 'role:admin|super_admin'])->group(function () {
    Route::get('/admin', function () {
        return redirect()->route('admin.dashboard');
    });
    Route::get('/admin/dashboard', [DashboardController::class, 'dashboard'])
        ->name('admin.dashboard');

    Route::get('/barangay_profile', [BarangayProfileController::class, 'index'])->name('barangay_profile.index');
    Route::put('/barangay_profile/update/{barangay}', [BarangayProfileController::class, 'update'])->name('barangay_profile.update');

    Route::resource('user', UserController::class);
});

// CDRRMO Admin-only routes
Route::middleware(['auth', 'role:cdrrmo_admin'])->prefix('cdrrmo_admin')->group(function () {
    Route::get('alldatacollection', [CDRRMOAdminController::class, 'allDataCollectionSummary'])
        ->name('cdrrmo_admin.datacollection');

    Route::post('/addCRA', [CRADataController::class, 'addCRA'])->name('cdrrmo_admin.addcra');

    Route::get('/population', [CRADataController::class, 'population'])->name('cdrrmo_admin.population');
    Route::get('/livelihood', [CRADataController::class, 'livelihood'])->name('cdrrmo_admin.livelihood');
    Route::get('/services', [CRADataController::class, 'services'])->name('cdrrmo_admin.services');
    Route::get('/infraFacilities', [CRADataController::class, 'infraFacilities'])->name('cdrrmo_admin.infraFacilities');
    Route::get('/primaryFacilities', [CRADataController::class, 'primaryFacilities'])->name('cdrrmo_admin.primaryFacilities');
    Route::get('/institutions', [CRADataController::class, 'institutions'])->name('cdrrmo_admin.institutions');
    Route::get('/humanResources', [CRADataController::class, 'humanResources'])->name('cdrrmo_admin.humanResources');
    Route::get('/populationimpact', [CRADataController::class, 'populationimpact'])->name('cdrrmo_admin.populationimpact');
    Route::get('/effectimpact', [CRADataController::class, 'effectimpact'])->name('cdrrmo_admin.effectimpact');
    Route::get('/damageproperty', [CRADataController::class, 'damageproperty'])->name('cdrrmo_admin.damageproperty');
    Route::get('/damageagri', [CRADataController::class, 'damageagri'])->name('cdrrmo_admin.damageagri');
    Route::get('/disasterlifelines', [CRADataController::class, 'disasterlifelines'])->name('cdrrmo_admin.disasterlifelines');
    Route::get('/hazardrisks', [CRADataController::class, 'hazardRisks'])->name('cdrrmo_admin.hazardrisks');
    Route::get('/riskmatrix', [CRADataController::class, 'riskMatrix'])->name('cdrrmo_admin.riskmatrix');
    Route::get('/vulnerabilitymatrix', [CRADataController::class, 'vulnerabilityMatrix'])->name('cdrrmo_admin.vulnerabilitymatrix');
    Route::get('/populationexposure', [CRADataController::class, 'populationExposure'])->name('cdrrmo_admin.populationexposure');
    Route::get('/disabilities', [CRADataController::class, 'disabilityStatistics'])->name('cdrrmo_admin.disabilities');
    Route::get('/familiesatrisk', [CRADataController::class, 'familyAtRisk'])->name('cdrrmo_admin.familiesatrisk');
    Route::get('/illnessesstats', [CRADataController::class, 'illnessStatistics'])->name('cdrrmo_admin.illnessesstats');
    Route::get('/disasterpopulation', [CRADataController::class, 'disasterRiskPopulation'])->name('cdrrmo_admin.disasterpopulation');
    Route::get('/disasterinventory', [CRADataController::class, 'disasterInventories'])->name('cdrrmo_admin.disasterinventory');
    Route::get('/evacuationcenters', [CRADataController::class, 'evacuationCenters'])->name('cdrrmo_admin.evacuationcenters');
    Route::get('/evacuationinven', [CRADataController::class, 'evacuationInventories'])->name('cdrrmo_admin.evacuationinven');
    Route::get('/affectedPlaces', [CRADataController::class, 'affectedPlaces'])->name('cdrrmo_admin.affectedPlaces');
    Route::get('/livelihoodEvacuationSites', [CRADataController::class, 'livelihoodEvacuationSites'])->name('cdrrmo_admin.livelihoodEvacuationSites');
    Route::get('/prepositionedInventories', [CRADataController::class, 'prepositionedInventories'])->name('cdrrmo_admin.prepositionedInventories');
    Route::get('/reliefDistributions', [CRADataController::class, 'reliefDistributions'])->name('cdrrmo_admin.reliefDistributions');
    Route::get('/reliefProcess', [CRADataController::class, 'reliefDistributionProcesses'])->name('cdrrmo_admin.reliefProcess');
    Route::get('/bdrrmcTrainings', [CRADataController::class, 'bdrrmcTrainings'])->name('cdrrmo_admin.bdrrmcTrainings');
    Route::get('/equipmentInventories', [CRADataController::class, 'equipmentInventories'])->name('cdrrmo_admin.equipmentInventories');
    Route::get('/bdrrmcDirectories', [CRADataController::class, 'bdrrmcDirectories'])->name('cdrrmo_admin.bdrrmcDirectories');
    Route::get('/evacuationPlans', [CRADataController::class, 'evacuationPlans'])->name('cdrrmo_admin.evacuationPlans');
    Route::delete('/cra/delete/{year}', [CRADataController::class, 'destroy'])->name('cdrrmo_admin.destroy');

    // reports
    Route::get('/cra/population-exposure-summary/pdf', [ReportGenerationController::class, 'exportPopulationExposureSummary'])
    ->name('population.exposure.summary.pdf');
    Route::get('/cra/population-overview-summary/pdf', [ReportGenerationController::class, 'exportPopulationOverviewSummary'])
    ->name('population.overview.summary.pdf');
    Route::get('/cra/top-hazard/pdf', [ReportGenerationController::class, 'exportTopHazardsSummary'])
    ->name('top-hazard.summary.pdf');
    Route::get('/cra/livelihood-summary/pdf', [ReportGenerationController::class, 'exportLivelihoodSummary'])
    ->name('livelihood.summary.pdf');
    Route::get('/cra/hr-summary/pdf', [ReportGenerationController::class, 'exportHumanResourcesSummary'])
    ->name('hr.summary.pdf');
    Route::get('/cra/disaster-risk-population-summary/pdf', [ReportGenerationController::class, 'exportOverallDisasterRiskPopulationSummary'])
    ->name('disasterriskpopulation.summary.pdf');
    Route::get('/cra/risk-assessment-summary/pdf', [ReportGenerationController::class, 'exportOverallRiskMatrixSummary'])
    ->name('riskassessment.summary.pdf');
    Route::get('/cra/vulnerability-assessment-summary/pdf', [ReportGenerationController::class, 'exportOverallVulnerabilityMatrixSummary'])
    ->name('vulnerabilityassessment.summary.pdf');
});

// Super Admin-only routes
Route::middleware(['auth', 'role:super_admin'])->prefix('super_admin')->group(function () {
    Route::get('/dashboard', [SuperAdminController::class, 'index'])->name('super_admin.dashboard');
    Route::get('/accounts', [SuperAdminController::class, 'accounts'])->name('super_admin.accounts');
    Route::put('/update/account/{id}', [SuperAdminController::class, 'updateAccount'])->name('super_admin.account.update');
    Route::post('/store/account', [SuperAdminController::class, 'addAccount'])->name('super_admin.account.store');
    Route::get('/details/{id}', [SuperAdminController::class, 'accountDetails'])->name('super_admin.account.details');
    Route::get('/barangay_details/{id}', [BarangayController::class, 'barangayDetails'])->name('barangay.details');
    Route::resource('barangay', BarangayController::class);

    // reports
    Route::get('/statistics/population-summary', [SuperAdminDataController::class, 'populationSummary'])->name('super_admin.statistics.population_summary');
    Route::get('/statistics/employment-summary', [SuperAdminDataController::class, 'employmentSummary'])->name('super_admin.statistics.employment_summary');


    // exports
    Route::get('/statistics/population-summary-export', [SuperAdminDataController::class, 'exportPopulationSummaryByAgeGroup'])->name('super_admin.export.population_summary');
    Route::get('/statistics/purok-population-summary-export', [SuperAdminDataController::class, 'exportPopulationSummaryByPurok'])->name('super_admin.export.purok_population_summary');
    Route::get('/statistics/sex-population-summary-export', [SuperAdminDataController::class, 'exportPopulationSummaryBySex'])->name('super_admin.export.sex_population_summary');
    Route::get('/statistics/employment-summary-export', [SuperAdminDataController::class, 'exportEmploymentSummary'])->name('super_admin.export.employment_summary');

});

Route::middleware(['auth', 'role:resident|barangay_officer'])->group(function () {
    Route::get('/account/user/basic-information', [ResidentAccountController::class, 'basicInformation'])
        ->name('resident_account.basic.info');

    Route::put('/account/user/update-information', [ResidentAccountController::class, 'updateInfo'])
        ->name('resident_account.update.info');
});

// Routes accessible to both resident and admin users (verified users)
Route::middleware(['auth', 'role:resident|barangay_officer|super_admin|admin|cdrrmo_admin'])->group(function () {
    // Profile management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});




require __DIR__ . '/auth.php';

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';

const INITIAL_STATE = {
    name: '',
    age: '',
    gender: 'Unknown',
    weight_kg: '',
    height_cm: '',
    blood_type: '',
    allergies: '',
    medications: '',
    medical_history: '',
    asa_class: 'I',
    status: 'pre_op',
    systolic_bp: '',
    diastolic_bp: '',
    heart_rate: '',
    spo2: '',
    temperature: '',
    diabetes: false,
    hypertension: false,
    cardiac_hx: false,
    smoking: false
};

export default function PatientFormModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Format arrays and numbers before submitting
            const submissionData = {
                ...formData,
                age: parseInt(formData.age) || 45,
                weight_kg: parseFloat(formData.weight_kg) || 70,
                height_cm: parseFloat(formData.height_cm) || 170,
                systolic_bp: parseFloat(formData.systolic_bp) || null,
                diastolic_bp: parseFloat(formData.diastolic_bp) || null,
                heart_rate: parseFloat(formData.heart_rate) || null,
                spo2: parseFloat(formData.spo2) || null,
                temperature: parseFloat(formData.temperature) || null,
                allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
                medications: formData.medications ? formData.medications.split(',').map(s => s.trim()) : [],
                medical_history: formData.medical_history ? formData.medical_history.split(',').map(s => s.trim()) : []
            };

            await onSubmit(submissionData);
            setFormData(INITIAL_STATE);
            onClose();
        } catch (error) {
            console.error("Failed to submit patient:", error);
            alert("Failed to add patient. Please check the console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-900/40 flex items-center justify-center border border-teal-800/50">
                            <UserPlus className="text-teal-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Register New Patient</h2>
                            <p className="text-gray-400 text-xs mt-0.5">Enter patient demographics, history, and initial vitals</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Section 1: Demographics */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                            Demographics
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm" placeholder="e.g. John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Age</label>
                                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm" placeholder="45" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm">
                                    <option value="Unknown">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Weight (kg)</label>
                                <input type="number" step="0.1" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm" placeholder="70.0" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Height (cm)</label>
                                <input type="number" step="0.1" name="height_cm" value={formData.height_cm} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm" placeholder="170.0" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-800" />

                    {/* Section 2: Clinical Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                            Clinical History
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">ASA Classification</label>
                                <select name="asa_class" value={formData.asa_class} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm">
                                    <option value="I">ASA I - Normal healthy</option>
                                    <option value="II">ASA II - Mild systemic disease</option>
                                    <option value="III">ASA III - Severe systemic disease</option>
                                    <option value="IV">ASA IV - Severe, life-threatening</option>
                                    <option value="V">ASA V - Moribund</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Blood Type</label>
                                <input type="text" name="blood_type" value={formData.blood_type} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm" placeholder="e.g. O+" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Allergies (comma separated)</label>
                                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm" placeholder="Penicillin, Peanuts..." />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Medications (comma separated)</label>
                                <input type="text" name="medications" value={formData.medications} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-sm" placeholder="Lisinopril, Metformin..." />
                            </div>
                        </div>

                        {/* Co-morbidities Toggles */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer bg-gray-800/50 p-2 rounded-lg border border-gray-700 hover:bg-gray-800">
                                <input type="checkbox" name="hypertension" checked={formData.hypertension} onChange={handleChange} className="rounded border-gray-600 text-teal-500 focus:ring-teal-500/30 bg-gray-700" />
                                Hypertension
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer bg-gray-800/50 p-2 rounded-lg border border-gray-700 hover:bg-gray-800">
                                <input type="checkbox" name="diabetes" checked={formData.diabetes} onChange={handleChange} className="rounded border-gray-600 text-teal-500 focus:ring-teal-500/30 bg-gray-700" />
                                Diabetes
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer bg-gray-800/50 p-2 rounded-lg border border-gray-700 hover:bg-gray-800">
                                <input type="checkbox" name="cardiac_hx" checked={formData.cardiac_hx} onChange={handleChange} className="rounded border-gray-600 text-teal-500 focus:ring-teal-500/30 bg-gray-700" />
                                Cardiac History
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer bg-gray-800/50 p-2 rounded-lg border border-gray-700 hover:bg-gray-800">
                                <input type="checkbox" name="smoking" checked={formData.smoking} onChange={handleChange} className="rounded border-gray-600 text-teal-500 focus:ring-teal-500/30 bg-gray-700" />
                                Smoker
                            </label>
                        </div>
                    </div>

                    <hr className="border-gray-800" />

                    {/* Section 3: Baseline Vitals (Optional) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider">Current Vitals</h3>
                            <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">(Optional - for ML Predictor)</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">Systolic BP</label>
                                <input type="number" name="systolic_bp" value={formData.systolic_bp} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm" placeholder="120" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">Diastolic BP</label>
                                <input type="number" name="diastolic_bp" value={formData.diastolic_bp} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm" placeholder="80" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">Heart Rate</label>
                                <input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm" placeholder="75" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">SpO2 (%)</label>
                                <input type="number" name="spo2" value={formData.spo2} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-rose-500 transition-colors text-sm" placeholder="98" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !formData.name} className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 border border-teal-500 rounded-xl transition-all shadow-lg shadow-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {isSubmitting ? 'Registering...' : 'Register Patient'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
